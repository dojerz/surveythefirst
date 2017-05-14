using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FirstLook.Models
{
    public class Base
    {
        public int ID { get; set; }
        public string BaseID { get; set; }
        public string Name { get; set; }
        public string Transmission { get; set; }
        public string Capacity { get; set; }
        public string Altitude { get; set; }
        public List<SelectListItem> getBuildingTypes { get; set; }
        public List<SelectListItem> getSettlements { get; set; }
        public string WgsLAT { get; set; }      // x
        public string WgsLON { get; set; }      // y
        public int SelectedSettlementID { get; set; }
        public string SelectedSettlementName { get; set; }
        public int SelectedBuildingTypeID { get; set; }
        public string SelectedBuildingTypeName { get; set; }
        public float distanceFromSurveyPoint { get; set; }

        public List<Photo> BasePictures = new List<Photo>();
        public List<Photo> NearPictures = new List<Photo>();
        public List<Photo> FarPictures = new List<Photo>();

        public Base()
        {

        }

        public Base(List<BuildingTypes> bTypes, List<Settlements> sett)
        {
            getBuildingTypes = getAllBuildingTypes(bTypes);
            getSettlements = getAllSettlements(sett);
        }

        public Base( Bases b, List<BuildingTypes> bTypes, List<Settlements> setts)
        {
            this.ID = b.ID;
            BaseID = b.BaseID;
            this.Name = b.Name;
            this.Transmission = b.Transmission;
            this.Capacity = b.Capacity;
            this.Altitude = b.Altitude;
            this.WgsLAT = b.WgsLAT;
            this.WgsLON = b.WgsLON;
            this.SelectedBuildingTypeID = (int)b.BuildingID;
            this.SelectedSettlementID = (int)b.SettlementID;
            getSelectedSettlementName(setts);
            getSelectedBuildingTypeName(bTypes);
            getBuildingTypes = getAllBuildingTypes(bTypes);
            getSettlements = getAllSettlements(setts);
        }

        public Bases createDbBase()
        {
            Bases b = new Bases();
            b.ID = this.ID;
            b.BaseID = BaseID;
            b.Name = this.Name;
            b.Transmission = this.Transmission;
            b.Capacity = this.Capacity;
            b.Altitude = this.Altitude;
            b.WgsLAT = this.WgsLAT;
            b.WgsLON = this.WgsLON;
            b.BuildingID = this.SelectedBuildingTypeID;
            b.SettlementID = this.SelectedSettlementID;
            return b;
        }

        private void getSelectedSettlementName(List<Settlements> setts)
        {
            int listLength = setts.Count();
            for (int i = 0; i < listLength; i++)
            {
                if( setts[i].ID == SelectedSettlementID)
                {
                    SelectedSettlementName = setts[i].Settlement;
                }
            }
        }

        private void getSelectedBuildingTypeName(List<BuildingTypes> bTypes)
        {
            int listLength = bTypes.Count();
            for (int i = 0; i < listLength; i++)
            {
                if (bTypes[i].ID == SelectedBuildingTypeID)
                {
                    SelectedBuildingTypeName = bTypes[i].Type;
                }
            }
        }

        private List<SelectListItem> getAllBuildingTypes(List<BuildingTypes> l)
        {
            List<SelectListItem> myList = new List<SelectListItem>();
            int listLength = l.Count();
            var data = new SelectListItem[listLength];
            for( int i = 0; i < listLength; i++ )
            {
                myList.Add(new SelectListItem { Value = l[i].ID.ToString(), Text = l[i].Type });
            }
            return myList;
        }

        private List<SelectListItem> getAllSettlements(List<Settlements> l)
        {
            List<SelectListItem> myList = new List<SelectListItem>();
            int listLength = l.Count();
            var data = new SelectListItem[listLength];
            for (int i = 0; i < listLength; i++)
            {
                myList.Add(new SelectListItem { Value = l[i].ID.ToString(), Text = l[i].Settlement });
            }
            return myList;
        }

        public bool amIInsideTheCircle(string placeX, string placeY, string radius)
        {
            float x = float.Parse(placeX);
            float y = float.Parse(placeY);
            float myX = float.Parse(WgsLAT);
            float myY = float.Parse(WgsLON);
            float rad = float.Parse(radius);

            if (x == 0.0 && y == 0.0)
            {
                if( (Math.Pow(myX, 2) + Math.Pow(myY, 2)) <= Math.Pow(rad, 2) )
                {
                    return true;
                }
                return false;
            }
            else
            {
                if( (Math.Pow((myX - x), 2) + Math.Pow((myY - y), 2)) <= Math.Pow(rad, 2) )
                {
                    return true;
                }
                return false;
            }
        }

        public bool amIInsideTheRadius(string surveyX, string surveyY, string surveyRadius)
        {
            float radius = float.Parse(surveyRadius)*1000;

            float distance = getDistanceFromSurveyPoint(surveyX, surveyY);
            if (distance <= radius)
            {
                distanceFromSurveyPoint = (float)Math.Round( (Decimal)(distance / 1000), 3, MidpointRounding.AwayFromZero);    // in km
                return true;
            }
            return false;
        }

        private float getDistanceFromSurveyPoint(string surveyX, string surveyY)
        {
            float x = float.Parse(surveyX);
            float y = float.Parse(surveyY);
            float myX = float.Parse(WgsLAT);
            float myY = float.Parse(WgsLON);

            // calculate distance between 2 points (surveyPoint and basePoint) by Haversine

            float r = 6371000; // radius of Earth
            float latRadS = (float)(x * Math.PI / 180);
            float latRadB = (float)(myX * Math.PI / 180);
            float lonRadS = (float)(y * Math.PI / 180);
            float lonRadB = (float)(myY * Math.PI / 180);
            float latTag = (float)(1 - Math.Cos(latRadB - latRadS)) / 2;
            float lonTag = (float)(1 - Math.Cos(lonRadB - lonRadS)) / 2;

            float distance = (float)(2 * r * Math.Asin(Math.Sqrt(latTag + Math.Cos(latRadS) * Math.Cos(latRadB) * lonTag)));
            return distance;
        }
    }
}