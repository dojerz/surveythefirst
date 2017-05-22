using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FirstLook.Models
{
    public class Photo
    {
        public string Name { get; set; }
        public string BaseID { get; set; }
        public int ViewRange { get; set; }
        public int Angle { get; set; }
        public int Number { get; set; }
        public string Folder { get; set; }
        public byte[] Mini { get; set; }
    }
}