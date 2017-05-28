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
        public PartialViewResult Save(string siteAddress, string lat, string lon, string baseID)
        {
            var surveyStates = bazisok.SurveyStates.ToList();
            Survey newSurvey = new Survey(surveyStates);
            newSurvey.SiteAddress = siteAddress;
            newSurvey.WgsLAT = float.Parse(lat);
            newSurvey.WgsLON = float.Parse(lon);
            newSurvey.BaseID = baseID;
            return PartialView("SurveyModal", newSurvey);
        }

        [HttpPost]
        public void Save(Survey survey)
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
            //return RedirectToAction("Surveys");
        }

        [HttpPost]
        public void Kamu()
        {

        }

        // GET: Surveys
        public ActionResult Surveys()
        {
            List<Survey> surveys = getSurveyList();
            return View(surveys);
        }

        private List<Survey> getSurveyList()
        {
            List<Survey> surveys = new List<Survey>();
            var existingSurveys = bazisok.Surveys.ToList();
            var surveyStates = bazisok.SurveyStates.ToList();
            int listength = existingSurveys.Count();
            for (int i = 0; i < listength; i++)
            {
                surveys.Add(new Survey(existingSurveys[i], surveyStates));
            }
            return surveys;
        }

        // GET: Survey/FilteredSurveys/{Coords}
        public PartialViewResult FilteredSurveys()
        {
            List<Survey> filteredSurveys = getSurveyList();
            return PartialView("~/Views/Survey/FilteredSurveys.cshtml", filteredSurveys);
        }
    }
}