using Microsoft.EntityFrameworkCore;
using RestApi.Models;

namespace RestApi.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }

        // Constructor accepting DbContextOptions
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Username).HasMaxLength(150);
                entity.Property(e => e.Password).HasMaxLength(150);
                entity.Property(e => e.Email).HasMaxLength(255);
            });

            // Seed initial data
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "john", Password = "12345", FullName = "John Doe", Email = "john@example.com", Role = "admin" },
                new User { Id = 2, Username = "jane", Password = "54321", FullName = "Jane Smith", Email = "jane@example.com", Role = "user" }
            );

            modelBuilder.Entity<Post>().HasData(
                new Post { Id = 1, Title = "Admin Post", Content = "This is an admin post.", UserId = 1 },
                new Post { Id = 2, Title = "User Post", Content = "This is a user post.", UserId = 2 }
            );
        }
    }
}