using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Data.Entity;
using FirstLook.Models;
using System.IO;

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
            /*List<string> filesBase;
            List<string> filesNear;
            List<string> filesFar;*/
            if (isInit == 1)
            {
                List<Base> bases = createBaseList();
                var listLength = bases.Count();
                for (int b = 0; b < listLength; b++)
                {
                    if (bases[b].amIInsideTheRadius(xCoord, yCoord, radius))
                    {
                        filteredBases.Add(bases[b]);
                        /*string baseID = filteredBases[filteredBases.Count() - 1].BaseID;
                        try
                        {
                            filesBase = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Base\").ToList();
                            filesNear = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Near\").ToList();
                            filesFar = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Far\").ToList();

                            foreach (var file in filesBase)
                            {
                                string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                                string[] parts = Name.Split('_');
                                Photo photo = new Photo();
                                photo.Name = Name;
                                photo.BaseID = baseID;
                                photo.Number = int.Parse(parts[2]);
                                photo.ThumbNailContent = imageManager.GetSmallImage(System.IO.File.ReadAllBytes(file), 140, 50);
                                bool inserted = false;
                                int lLength = filteredBases[filteredBases.Count() - 1].BasePictures.Count();
                                for (int i = 0; i < lLength; i++)
                                {
                                    if (filteredBases[filteredBases.Count() - 1].BasePictures[i].Number > photo.Number)
                                    {
                                        filteredBases[filteredBases.Count() - 1].BasePictures.Insert(i, photo);
                                        inserted = true;
                                        break;
                                    }
                                }
                                if (!inserted)
                                {
                                    filteredBases[filteredBases.Count() - 1].BasePictures.Add(photo);
                                }
                            }
                            foreach (var file in filesNear)
                            {
                                string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                                string[] parts = Name.Split('_');
                                Photo photo = new Photo();
                                photo.Name = Name;
                                photo.BaseID = baseID;
                                string a = parts[2];
                                int viewRange;
                                if(a == "k")
                                {
                                    viewRange = 0;
                                }
                                else
                                {
                                    viewRange = 1;
                                }
                                //int viewRange = int.Parse(parts[2]);
                                int angle = int.Parse(parts[3]);
                                photo.ViewRange = viewRange;
                                photo.Angle = angle;
                                photo.ThumbNailContent = imageManager.GetSmallImage(System.IO.File.ReadAllBytes(file), 140, 50);
                                bool inserted = false;
                                int lLength = filteredBases[filteredBases.Count() - 1].NearPictures.Count();
                                for (int i = 0; i < lLength; i++)
                                {
                                    if (filteredBases[filteredBases.Count() - 1].NearPictures[i].Angle > photo.Angle)
                                    {
                                        filteredBases[filteredBases.Count() - 1].NearPictures.Insert(i, photo);
                                        inserted = true;
                                        break;
                                    }
                                }
                                if (!inserted)
                                {
                                    filteredBases[filteredBases.Count() - 1].NearPictures.Add(photo);
                                }
                            }
                            foreach (var file in filesFar)
                            {
                                string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                                string[] parts = Name.Split('_');
                                Photo photo = new Photo();
                                photo.Name = Name;
                                photo.BaseID = baseID;
                                string a = parts[2];
                                int viewRange;
                                if (a == "t")
                                {
                                    viewRange = 0;
                                }
                                else
                                {
                                    viewRange = 1;
                                }
                                //int viewRange = int.Parse(parts[2]);
                                int angle = int.Parse(parts[3]);
                                photo.ViewRange = viewRange;
                                photo.Angle = angle;
                                photo.ThumbNailContent = imageManager.GetSmallImage(System.IO.File.ReadAllBytes(file), 140, 50);
                                bool inserted = false;
                                int lLength = filteredBases[filteredBases.Count() - 1].FarPictures.Count();
                                for (int i = 0; i < lLength; i++)
                                {
                                    if (filteredBases[filteredBases.Count() - 1].FarPictures[i].Angle > photo.Angle)
                                    {
                                        filteredBases[filteredBases.Count() - 1].FarPictures.Insert(i, photo);
                                        inserted = true;
                                        break;
                                    }
                                }
                                if (!inserted)
                                {
                                    filteredBases[filteredBases.Count() - 1].FarPictures.Add(photo);
                                }
                            }
                        }
                        catch (DirectoryNotFoundException dirEx)
                        {
                            Console.WriteLine("Directory not found: " + dirEx.Message);
                        }*/
                    }
                }
            }
            filteredBases = sortBasesByDistance(filteredBases);
            //CreateMiniPhotos();

            return PartialView("~/Views/Base/FilteredBases.cshtml", filteredBases);
        }

        // GET: Base/GetBasePhotos/...
        public PartialViewResult GetBasePhotos(string baseID, string range)
        {
            List<Photo> photos = new List<Photo>();
            List<string> miniFiles;
            List<string> originalFiles;
            string folder;
            if (range == "b")
            {
                folder = "Base";
                originalFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Original\Base\").ToList();
                miniFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Mini\Base\").ToList();
                foreach (var file in originalFiles)
                {
                    string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                    string[] parts = Name.Split('_');
                    Photo photo = new Photo();
                    photo.Folder = folder;
                    photo.Name = Name;
                    photo.BaseID = baseID;
                    photo.Number = int.Parse(parts[2]);
                    foreach (var mFile in miniFiles)
                    {
                        string mName = System.IO.Path.GetFileNameWithoutExtension(mFile);
                        if(mName == Name)
                        {
                            photo.Mini = System.IO.File.ReadAllBytes(mFile);
                        }
                    }
                    bool inserted = false;
                    int lLength = photos.Count();
                    for (int i = 0; i < lLength; i++)
                    {
                        if (photos[i].Number > photo.Number)
                        {
                            photos.Insert(i, photo);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted)
                    {
                        photos.Add(photo);
                    }
                }
            }
            else if(range == "k" || range == "t")
            {
                if(range == "k")
                {
                    folder = "Near";
                    miniFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Mini\Near\").ToList();
                    originalFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Original\Near\").ToList();
                }
                else
                {
                    folder = "Far";
                    miniFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Mini\Far\").ToList();
                    originalFiles = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Original\Far\").ToList();
                }
                
                foreach (var file in originalFiles)
                {
                    string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                    string[] parts = Name.Split('_');
                    Photo photo = new Photo();
                    photo.Folder = folder;
                    photo.Name = Name;
                    photo.BaseID = baseID;
                    int angle = int.Parse(parts[3]);
                    photo.Angle = angle;
                    foreach (var mFile in miniFiles)
                    {
                        string mName = System.IO.Path.GetFileNameWithoutExtension(mFile);
                        if (mName == Name)
                        {
                            photo.Mini = System.IO.File.ReadAllBytes(mFile);
                        }
                    }
                    bool inserted = false;
                    int lLength = photos.Count();
                    for (int i = 0; i < lLength; i++)
                    {
                        if (photos[i].Angle > photo.Angle)
                        {
                            photos.Insert(i, photo);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted)
                    {
                        photos.Add(photo);
                    }
                }
            }
            return PartialView("~/Views/Base/BasePhotos.cshtml", photos);
        }

        private List<Base> sortBasesByDistance(List<Base> bases)
        {
            List<Base> sortedBases = bases.OrderBy(b=>b.distanceFromSurveyPoint).ToList();
            return sortedBases;
        }

        public ActionResult GetOriginalPhoto(string baseID, string name, string folder)
        {
            List<string> files = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\" + baseID + @"\Original\" + folder + @"\").ToList();
            string phPath = files.Where(i => System.IO.Path.GetFileNameWithoutExtension(i) == name).FirstOrDefault();
            byte[] imageByteData = System.IO.File.ReadAllBytes(phPath);
            return File(imageByteData, "image/jpg");
        }

        public void CreateMiniPhotos()
        {
            List<string> files = System.IO.Directory.GetFiles(@"C:\Users\Dani\Desktop\TestImages\Prater_1\Original\Far\").ToList();
            foreach (var file in files)
            {
                string Name = System.IO.Path.GetFileNameWithoutExtension(file);
                byte[] ThumbNailContent = imageManager.GetSmallImage(System.IO.File.ReadAllBytes(file), 140, 50);
                //var base64 = Convert.ToBase64String(ThumbNailContent);
                //var imgSrc = String.Format("data:image/jpeg;base64,{0}", base64);
                System.IO.File.WriteAllBytes(@"C:\Users\Dani\Desktop\TestImages\Prater_1\Mini\Far\" + Name + ".jpg", ThumbNailContent);
            }
        }


    }
}