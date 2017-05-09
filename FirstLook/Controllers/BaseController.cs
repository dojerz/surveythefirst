using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Data.Entity;
using FirstLook.Models;

namespace FirstLook.Controllers
{
    public class BaseController : Controller
    {
        private BazisokEntities4 bazisok = new BazisokEntities4();
        //private List<Base> bases = new List<Base>();
        //private BazisokEntities bazisok = new BazisokEntities();
        ImageHandler.Manage imageManager = new ImageHandler.Manage();

        private Base getBaseByID(int ID, List<Base> bases)
        {

            int listLength = bases.Count;
            for( int i = 0; i < listLength; i++ )
            {
                if( bases[i].ID == ID )
                {
                    return bases[i];
                }
            }
            return null;
        }

        private List<Base> createBaseList()
        {
            List<Base> bases = new List<Base>();
            var existingBases = bazisok.Bases.ToList();
            var buildingTypes = bazisok.BuildingTypes.ToList();
            var settlements = bazisok.Settlements.ToList();
            var listength = existingBases.Count();
            for (int i = 0; i < listength; i++)
            {
                bases.Add(new Base(existingBases[i], buildingTypes, settlements));
            }
            return bases;
        }

        // GET: Base
        public ActionResult Index()
        {
            List<Base> bases = createBaseList();
            return View(bases);
        }

        // GET: Base/Create
        public ActionResult Create()
        {
            var buildingTypes = bazisok.BuildingTypes.ToList();
            var settlements = bazisok.Settlements.ToList();
            return View(new Base(buildingTypes, settlements));
        }
        
        // POST: Base/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Base b)
        {
            if (ModelState.IsValid)
            {
                var existingBases = bazisok.Bases.ToList();
                var maxId = 0;
                if (existingBases.Count() > 0)
                {
                    maxId = existingBases.Max(i => i.ID);
                    maxId = maxId + 1;
                }
                b.ID = maxId;
                Bases bs = b.createDbBase();
                bazisok.Bases.Add(bs);
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }

            return View();
        }
        
        // GET: Base/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            List<Base> bases = createBaseList();
            Base b = getBaseByID(bazisok.Bases.Find(id).ID, bases);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: Base/Edit/5 
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(Base b)
        {
            if (ModelState.IsValid)
            {
                Bases bs = b.createDbBase();
                bazisok.Entry(bs).State = EntityState.Modified;
                bazisok.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(b);
        }
        
        // GET: Base/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            List<Base> bases = createBaseList();
            Base b = getBaseByID(bazisok.Bases.Find(id).ID, bases);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }
        
        // GET: Base/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            List<Base> bases = createBaseList();
            Base b = getBaseByID(bazisok.Bases.Find(id).ID, bases);
            if (b == null)
            {
                return HttpNotFound();
            }
            return View(b);
        }

        // POST: Base/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Bases bs = bazisok.Bases.Find(id);
            bazisok.Bases.Remove(bs);
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

        // GET: Base/FilteredBases/{Coords}
        public PartialViewResult FilteredBases( string init, string xCoord, string yCoord, string radius )
        {
            List<Base> filteredBases = new List<Base>();
            int isInit = int.Parse(init);
            List<string> files;
            if (isInit == 1)
            {
                List<Base> bases = createBaseList();
                var listLength = bases.Count();
                for (int b = 0; b < listLength; b++)
                {
                    if (bases[b].amIInsideTheRadius(xCoord, yCoord, radius))
                    {
                        filteredBases.Add(bases[b]);
                        string baseID = filteredBases[filteredBases.Count() - 1].BaseID;
                        files = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\").OrderBy(p => p).ToList();
                        foreach (var file in files)
                        {
                            string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                            string[] parts = Name.Split('_');
                            int viewRange = int.Parse(parts[2]);
                            int angle = int.Parse(parts[3]);
                            Photo photo = new Photo();
                            photo.Name = Name;
                            photo.BaseID = baseID;
                            photo.ViewRange = viewRange;
                            photo.Angle = angle;
                            photo.ThumbNailContent = imageManager.GetSmallImage(System.IO.File.ReadAllBytes(file), 140, 50);
                            if(viewRange == 0)
                            {
                                filteredBases[filteredBases.Count() - 1].NearPictures.Add(photo);
                            }
                            else
                            {
                                filteredBases[filteredBases.Count() - 1].FarPictures.Add(photo);
                            }
                        }
                    }
                }
            }
            filteredBases = sortBasesByDistance(filteredBases);

            return PartialView("~/Views/Base/FilteredBases.cshtml", filteredBases);
        }

        private List<Base> sortBasesByDistance(List<Base> bases)
        {
            List<Base> sortedBases = bases.OrderBy(b=>b.distanceFromSurveyPoint).ToList();
            return sortedBases;
        }

        public ActionResult GetOriginalPicture(string baseID, string name)
        {
            List<string> files = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\").ToList();
            string picPath = files.Where(i => System.IO.Path.GetFileNameWithoutExtension(i) == name).FirstOrDefault();
            byte[] imageByteData = System.IO.File.ReadAllBytes(picPath);
            return File(imageByteData, "image/jpg");
        }


    }
}