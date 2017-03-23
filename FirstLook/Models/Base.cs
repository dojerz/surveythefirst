using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FirstLook.Models
{
    public class Base
    {
        public int ID { get; set; }
        public string Place { get; set; }
        public string Name { get; set; }
        public int BuildingTypeID { get; set; }
        public string WGsLAT { get; set; }
        public string WgsLON { get; set; }
    }
}