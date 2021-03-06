﻿using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class DatingContext : DbContext
    {
        //private IDatabaseInitializer<DatingContext> Initialize()
        //{
        //    DatingContext db = new DatingContext();
        //    db.Roles.Add(new Roles{rolename= "Admin"});
        //    db.SaveChanges();
        //    return db;
        //}
        //public DatingContext() : base("DatingContext")
        //{
        //    Database.SetInitializer<DatingContext>(Initialize())
        //}

        public DbSet<Dialog > Dialogs { get; set; }
        public DbSet<DialogList> DialogLists { get; set; }
        public DbSet<SiteUser> SiteUsers { get; set; }
        public DbSet<Gallery> Galleries { get; set; }
        public DbSet<LikeList> LikeList { get; set; }
        public DbSet<FriendList> Friends { get; set; }
        public DbSet<GuestList> Guests { get; set; }
        //public DbSet<Hobby> Hobbies { get; set; }
        public DbSet<HobbyList> HobbiesList { get; set;}
        public DbSet<HobbyOfUser> HobbyOfUsers { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<Avatar> Avatars { get; set; }

        public DbSet<Cities> Cities { get; set; }
        public DbSet<AgeForSearch> AgeForSearch { get; set; }
        public DbSet<Education> Education { get; set; }
        public DbSet<TypeForSearch> TypeForSearch { get; set; }

    }
}