namespace RestApi.Models
{
    public class UserSignUpDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } = "user";
    }
}