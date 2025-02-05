namespace RestApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; } // Exposing sensitive data! So, use lightweight DTO
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}