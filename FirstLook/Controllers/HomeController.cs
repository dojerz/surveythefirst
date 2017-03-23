using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FirstLook.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            //BazisokEntities bazisok = new BazisokEntities();
            //bazisok.Bazis.ToString();
            //ViewBag.Message = bazisok.Bazis.ToString() + " es ennyi";
            //var myList = bazisok.Bazis.ToList();
            //return myList[0].Megnevezes;
            //return bazisok.Bazis.ToList().ToString();
            //return View(bazisok.Bazis.ToList());
            //ViewBag.bazisokView = bazisok.Bazis.ToList();
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}