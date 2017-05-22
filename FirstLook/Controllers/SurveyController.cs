using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FirstLook.Models;

namespace FirstLook.Controllers
{
    public class SurveyController : Controller
    {
        private BazisokEntities4 bazisok = new BazisokEntities4();

        // GET: Survey
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public PartialViewResult Save(string siteAddress)
        {
            var surveyStates = bazisok.SurveyStates.ToList();
            Survey newSurvey = new Survey(surveyStates);
            newSurvey.SiteAddress = siteAddress;
            return PartialView("SurveyModal", newSurvey);
        }

        [HttpPost]
        public ActionResult Save(Survey survey)
        {
            if (ModelState.IsValid)
            {
                var existingSurveys = bazisok.Surveys.ToList();
                var maxId = 0;
                if (existingSurveys.Count() > 0)
                {
                    maxId = existingSurveys.Max(i => i.ID);
                    maxId = maxId + 1;
                }
                survey.ID = maxId;
                Surveys s = survey.createDbSurvey();
                bazisok.Surveys.Add(s);
                bazisok.SaveChanges();
            }
            return RedirectToAction("Surveys");
        }

        // GET: Surveys
        public ActionResult Surveys()
        {
            List<Survey> surveys = getSureyList();
            return View(surveys);
        }

        private List<Survey> getSureyList()
        {
            List<Survey> surveys = new List<Survey>();
            var existingSurveys = bazisok.Surveys.ToList();
            var surveyStates = bazisok.SurveyStates.ToList();
            /*var buildingTypes = bazisok.BuildingTypes.ToList();
            var settlements = bazisok.Settlements.ToList();*/
            var listength = existingSurveys.Count();
            for (int i = 0; i < listength; i++)
            {
                surveys.Add(new Survey(existingSurveys[i], surveyStates));
            }
            return surveys;
        }
    }
}