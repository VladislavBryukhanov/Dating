using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class DatingContext : DbContext
    {
        public DatingContext() : base("DatingContext")
        {
        }
        public DbSet<Dialog > Dialogs { get; set; }
        public DbSet<DialogList> DialogLists { get; set; }
        public DbSet<SiteUser> SiteUsers { get; set; }
        public DbSet<Gallery> Galleries { get; set; }
        public DbSet<LikeList> LikeList { get; set; }
        public DbSet<FriendList> Friends { get; set; }
        public DbSet<GuestList> Guests { get; set; }
        public DbSet<Hobby> Hobbies { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<Avatar> Avatars { get; set; }
    }
}