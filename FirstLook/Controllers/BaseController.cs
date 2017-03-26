using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Data.Entity;

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
        public ActionResult Create([Bind(Include = "HelyszinMegnev,Megnevezes,EpitmenytipusID,WGsLAT,WgsLON")] Bazis b)
        {
            if (ModelState.IsValid)
            {
                var existingBases = bazisok.Bazis.ToList();
                var maxId = existingBases.Max(i => i.Id);
                b.Id = maxId + 1;
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

        // GET: Movies/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Bazis b = bazisok.Bazis.Find(id);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: Movies/Edit/5 
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "Id,HelyszinMegnev,Megnevezes,EpitmenytipusID,WGsLAT,WgsLON")] Bazis b)
        {
            if (ModelState.IsValid)
            {
                bazisok.Entry(b).State = EntityState.Modified;
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(b);
        }

        // GET: Movies/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Bazis b = bazisok.Bazis.Find(id);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // GET: Movies/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Bazis b = bazisok.Bazis.Find(id);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: Movies/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Bazis b = bazisok.Bazis.Find(id);
            bazisok.Bazis.Remove(b);
            bazisok.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                bazisok.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}