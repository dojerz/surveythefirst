using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FirstLook.Models;

namespace FirstLook.Controllers
{
    public class BazisController : Controller
    {
        // GET: Bazis
        public ActionResult Index()
        {
            UpcMacroDBEntities UpcEntity = new UpcMacroDBEntities();

            var bazisok = UpcEntity.Bazis.ToList();

            return View(bazisok);
        }
    }
}