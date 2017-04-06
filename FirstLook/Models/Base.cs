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
        public string Name { get; set; }
        public string Transmission { get; set; }
        public string Capacity { get; set; }
        public string Altitude { get; set; }
        public List<SelectListItem> getBuildingTypes { get; set; }
        public List<SelectListItem> getSettlements { get; set; }
        public string WgsLAT { get; set; }      // Y
        public string WgsLON { get; set; }      // X
        public int SelectedSettlementID { get; set; }
        public string SelectedSettlementName { get; set; }
        public int SelectedBuildingTypeID { get; set; }
        public string SelectedBuildingTypeName { get; set; }

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

        /*public string getSelectedBuildingType()
        {
            string text = getBuildingTypes.Where(x => x.Selected).FirstOrDefault().Text;
            return text;
        }

        public int getSelectedBuildingValue()
        {
            int text = Int32.Parse(getBuildingTypes.Where(x => x.Selected).FirstOrDefault().Value);
            return text;
        }

        public string getSelectedSettlement()
        {
            string text = getSettlements.Where(x => x.Selected).FirstOrDefault().Text;
            return text;
        }

        public int getSelectedSettlementValue()
        {
            int text = Int32.Parse(getSettlements.Where(x => x.Selected).FirstOrDefault().Value);
            return text;
        }*/

        public bool amIInsideTheCircle(string placeX, string placeY, string radius)
        {
            double x = double.Parse(placeX);
            double y = double.Parse(placeY);
            double myX = double.Parse(WgsLON);
            double myY = double.Parse(WgsLAT);
            double rad = double.Parse(radius);

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
    }
}