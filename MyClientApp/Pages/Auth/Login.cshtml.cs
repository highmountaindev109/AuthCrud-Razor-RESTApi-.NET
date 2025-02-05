using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MyApp.Namespace
{
    public class LoginModel : PageModel
    {
        private readonly HttpClient _httpClient;

        public LoginModel(IHttpClientFactory httpClientFactory)
        {
            // Handling 'The SSL connection could not be established, see inner exception.'
            _httpClient = httpClientFactory.CreateClient("NoSSLValidation");
        }

        [BindProperty]
        public string Username { get; set; }

        [BindProperty]
        public string Password { get; set; }

        public string ErrorMessage { get; set; }
        public string Token { get; set; } // This will hold the token if login is successful

        public async Task<IActionResult> OnPostAsync()
        {
            var loginData = new
            {
                Username = this.Username,
                Password = this.Password
            };

            var jsonContent = new StringContent(JsonConvert.SerializeObject(loginData), Encoding.UTF8, "application/json");

            try
            {
                // Make the POST request to your backend API
                var response = await _httpClient.PostAsync("http://localhost:5290/api/auth/login", jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<LoginResponse>(responseBody);

                    Token = result.Token; // Save the token

                    // If do follow code, can store newly token data in localstorage only one time. when login after deleting token data which is stored in localstorage again, it doesn't be stored in localstorage again.
                    
                    // return RedirectToPage("/signup");
                }
                else
                {
                    var errorResponse = await response.Content.ReadAsStringAsync();
                    var errorResult = JsonConvert.DeserializeObject<ErrorResponse>(errorResponse);

                    // Differentiate between username and password errors based on API response
                    if (errorResult.ErrorCode == "INVALID_USERNAME")
                    {
                        ErrorMessage = "Invalid username. Please check your username.";
                    }
                    else if (errorResult.ErrorCode == "INVALID_PASSWORD")
                    {
                        ErrorMessage = "Incorrect password. Please try again.";
                    }
                    else
                    {
                        ErrorMessage = "Invalid login credentials.";
                    }
                }
            }
            catch (HttpRequestException ex)
            {
                ErrorMessage = $"HTTP Request failed: {ex.Message}";
            }

            return Page();
        }

        private class LoginResponse
        {
            public string Message { get; set; }
            public string Token { get; set; }
        }

        private class ErrorResponse
        {
            public string ErrorCode { get; set; }
            public string ErrorMessage { get; set; }
        }
    }
}
