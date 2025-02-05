using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RestApi.Data;
using RestApi.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace RestApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto signUpDto)
        {
            if (signUpDto == null)
            {
                return BadRequest(new { message = "Invalid request payload" });
            }

            try
            {
                if (_context.Users.Any(u => u.Username == signUpDto.Username))
                {
                    return BadRequest(new { message = "Username already taken" });
                }

                if (_context.Users.Any(u => u.Email == signUpDto.Email))
                {
                    return BadRequest(new { message = "Email already registered" });
                }

                string hashedPassword = HashPassword(signUpDto.Password);

                var newUser = new User
                {
                    Username = signUpDto.Username,
                    Password = hashedPassword,
                    FullName = signUpDto.FullName,
                    Email = signUpDto.Email,
                    Role = signUpDto.Role
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully", user = new { newUser.FullName, newUser.Email, newUser.Role } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", details = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto loginDto)
        {
            if (loginDto == null)
            {
                return BadRequest(new { message = "Invalid request payload" });
            }

            try
            {
                var user = _context.Users.SingleOrDefault(u => u.Username == loginDto.Username);
                
                if (user == null)
                {
                    // Specific error for invalid username
                    return Unauthorized(new { errorCode = "INVALID_USERNAME", errorMessage = "The username does not exist." });
                }

                if (!VerifyPasswordHash(loginDto.Password, user.Password))
                {
                    // Specific error for incorrect password
                    return Unauthorized(new { errorCode = "INVALID_PASSWORD", errorMessage = "The password is incorrect." });
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Login successful",
                    token = token
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", details = ex.Message });
            }
        }

        private bool VerifyPasswordHash(string enteredPassword, string storedPasswordHash)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(enteredPassword));
                var enteredPasswordHash = Convert.ToBase64String(bytes);
                return storedPasswordHash == enteredPasswordHash;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.Username),
                new System.Security.Claims.Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Store userId as a claim
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role),
                new System.Security.Claims.Claim("Email", user.Email),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:ExpiresInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
