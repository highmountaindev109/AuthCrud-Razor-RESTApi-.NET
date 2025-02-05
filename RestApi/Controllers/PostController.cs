using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Models;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RestApi.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            // Check if the logged-in user is an Admin
            var isAdmin = User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            if (isAdmin)
            {
                // Admin can see all posts
                var posts = await _context.Posts.ToListAsync();
                return Ok(posts);
            }

            // For non-admins, filter posts by userId
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var userPosts = await _context.Posts.Where(p => p.UserId == userId).ToListAsync();
            return Ok(userPosts);
        }

        // Get all posts (Admin can see all posts, User can see their own posts)
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPostById(int id)
        {
            // Check if the logged-in user is an Admin
            var isAdmin = User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            // Retrieve the post by ID
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            // If the user is not an Admin, ensure they can only access their own posts
            if (!isAdmin)
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                if (post.UserId != userId)
                {
                    return Forbid(); // Return 403 Forbidden if the post does not belong to the user
                }
            }

            // Admins can access any post
            return Ok(post);
        }


        // Helper method to extract userId from JWT claims
        private int? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier); // Retrieve userId from token claims
            if (userIdClaim == null)
            {
                return null;  // Return null if no userId is found
            }

            // Parse userId as integer
            if (int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }

            return null; // Return null if parsing fails
        }

        // Create a new post (Admin and User can create posts)
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] PostCreateDto postCreateDto)
        {
            var userId = GetUserIdFromClaims();

            if (userId == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }
            
            // 
            var isAdmin = User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            if (isAdmin) {
                return BadRequest(new { message = "Don't need to add post data" });
            }

            var post = new Post
            {
                Title = postCreateDto.Title,
                Content = postCreateDto.Content,
                UserId = userId.Value  // Set the userId as the current logged-in user
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] PostUpdateDto postUpdateDto)
        {
            // Check if the logged-in user is an Admin
            var isAdmin = User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            // Retrieve the post by ID
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            // If the user is not an Admin, ensure they can only update their own posts
            if (!isAdmin)
            { 
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                if (post.UserId != userId)
                {
                    return Forbid(); // Return 403 Forbidden if the post does not belong to the user
                }
            }

            // Update the post
            post.Title = postUpdateDto.Title;
            post.Content = postUpdateDto.Content;

            // Save the changes
            _context.Entry(post).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }


        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            // Check if the logged-in user is an Admin
            var isAdmin = User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            // Retrieve the post by ID
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            // If the user is not an Admin, ensure they can only delete their own posts
            if (!isAdmin)
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                if (post.UserId != userId)
                {
                    return Forbid(); // Return 403 Forbidden if the post does not belong to the user
                }
            }

            // Delete the post
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }

    }
}
