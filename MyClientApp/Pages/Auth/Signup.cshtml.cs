using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MyApp.Namespace
{
    public class SignupModel : PageModel
    {
        private readonly HttpClient _httpClient;

        public SignupModel(IHttpClientFactory httpClientFactory)
        {
            // Use the custom HttpClient with SSL bypass for local development
            _httpClient = httpClientFactory.CreateClient("NoSSLValidation");
        }

        [BindProperty]
        public string Username { get; set; }

        [BindProperty]
        public string Password { get; set; }

        [BindProperty]
        public string FullName { get; set; }

        [BindProperty]
        public string Email { get; set; }

        [BindProperty]
        public string Role { get; set; }

        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string ErrorMessage { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            var signUpData = new
            {
                Username = this.Username,
                Password = this.Password,
                FullName = this.FullName,
                Email = this.Email,
                Role = this.Role
            };

            var jsonContent = new StringContent(JsonConvert.SerializeObject(signUpData), Encoding.UTF8, "application/json");

            try
            {
                // Make the POST request to your backend API
                var response = await _httpClient.PostAsync("http://localhost:5290/api/auth/signup", jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    IsSuccess = true;
                    Message = "User registered successfully!";
                    ErrorMessage = null;
                    return RedirectToPage("/auth/login");
                }
                else
                {
                    IsSuccess = false;
                    ErrorMessage = "Error registering user. Please try again.";
                    Message = null;
                }
            }
            catch (HttpRequestException ex)
            {
                ErrorMessage = $"HTTP Request failed: {ex.Message}";
                IsSuccess = false;
            }

            return Page();
        }
    }

}
