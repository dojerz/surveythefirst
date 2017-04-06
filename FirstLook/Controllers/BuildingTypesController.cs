using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace FirstLook.Controllers
{
    public class BuildingTypesController : Controller
    {
        private BazisokEntities4 bazisok = new BazisokEntities4();

        // GET: BuildingTypes
        public ActionResult Index()
        {
            var bts = bazisok.BuildingTypes.ToList();
            return View(bts);
        }

        // GET: BuildingTypes/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: BuildingTypes/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(BuildingTypes b)
        {
            if (ModelState.IsValid)
            {
                var existingBases = bazisok.BuildingTypes.ToList();
                var maxId = 0;
                if (existingBases.Count() > 0)
                {
                    maxId = existingBases.Max(i => i.ID);
                    maxId = maxId + 1;
                }
                b.ID = maxId;
                bazisok.BuildingTypes.Add(b);
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }

            return View();
        }

        // GET: BuildingTypes/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var existingBases = bazisok.BuildingTypes.ToList();
            BuildingTypes b = bazisok.BuildingTypes.Find(id);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: BuildingTypes/Edit/5 
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(BuildingTypes b)
        {
            if (ModelState.IsValid)
            {
                bazisok.Entry(b).State = EntityState.Modified;
                bazisok.SaveChanges();
            }
            return RedirectToAction("Index");
        }

        // GET: BuildingTypes/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var existingBases = bazisok.BuildingTypes.ToList();
            BuildingTypes b = bazisok.BuildingTypes.Find(id);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: BuildingTypes/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            BuildingTypes b = bazisok.BuildingTypes.Find(id);
            bazisok.BuildingTypes.Remove(b);
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