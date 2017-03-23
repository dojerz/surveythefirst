using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FirstLook.Controllers
{
    public class BaseController : Controller
    {
        private BazisokEntities bazisok = new BazisokEntities();

        // GET: Base
        public ActionResult Index()
        {
            ViewBag.bazisokView = bazisok.Bazis.ToList();
            return View();
        }

        // GET: Base/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Base/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "Id,HelyszinMegnev,Megnevezes,EpitmenytipusID,WGsLAT,WgsLON")] Bazis b)
        {
            if (ModelState.IsValid)
            {
                /*Bazis b = new Bazis();
                b.Id = 3;
                b.HelyszinMegnev = Place;
                b.Megnevezes = Name;
                b.EpitmenytipusID = BuildingTypeID;
                b.WgsLAT = WgsLAT;
                b.WgsLON = WgsLON;*/
                bazisok.Bazis.Add(b);
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }

            return View();
        }
    }
}