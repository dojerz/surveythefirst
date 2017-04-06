using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace FirstLook.Controllers
{
    public class SettlementsController : Controller
    {
        private BazisokEntities4 bazisok = new BazisokEntities4();

        // GET: Settlements
        public ActionResult Index()
        {
            var settlements = bazisok.Settlements.ToList();
            return View(settlements);
        }

        // GET: Settlements/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Settlements/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Settlements s)
        {
            if (ModelState.IsValid)
            {
                var existingBases = bazisok.Settlements.ToList();
                var maxId = 0;
                if (existingBases.Count() > 0)
                {
                    maxId = existingBases.Max(i => i.ID);
                    maxId = maxId + 1;
                }
                s.ID = maxId;
                bazisok.Settlements.Add(s);
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }

            return View();
        }

        // GET: Settlements/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var existingBases = bazisok.Settlements.ToList();
            Settlements s = bazisok.Settlements.Find(id);
            if (s == null)
            {
                return HttpNotFound();
            }
            return View(s);
        }

        // POST: Settlements/Edit/5 
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(Settlements s)
        {
            if (ModelState.IsValid)
            {
                bazisok.Entry(s).State = EntityState.Modified;
                bazisok.SaveChanges();
            }
            return RedirectToAction("Index");
        }

        // GET: Settlements/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var existingBases = bazisok.Settlements.ToList();
            Settlements s = bazisok.Settlements.Find(id);
            if (s == null)
            {
                return HttpNotFound();
            }
            return View(s);
        }

        // POST: Settlements/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Settlements s = bazisok.Settlements.Find(id);
            bazisok.Settlements.Remove(s);
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