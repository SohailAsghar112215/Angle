using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AngleDB.Repository;
using AngleDB;

namespace Angle.Controllers
{
    public class POSController : Controller
    {
        // GET: POS
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult AllProducts()
        {
            try
            {
                ProductsRepo Productrepo = new ProductsRepo();
                List<TblProduct> Productslist = Productrepo.getProductslist();
                ViewBag.Productslist = Productslist;
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "POSController", "AllProducts");
            }
            return View();
        }
        public ActionResult Product()
        {
            try
            {

                ProductsRepo Pro = new ProductsRepo();
                ViewBag.AceCatList = Pro.getAceProductsCategorylist();
                ViewBag.DxCatList = Pro.getDxProductsCategorylist();
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "POSController", "AllProducts");
            }
            return View();
        }
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult SaveProduct(FormCollection FC)
        {
            ProductsRepo Repo = new ProductsRepo();
            string DxCat = "";
            string DxSP = "";
            string DxLD = "";
            string DxSD = "";

            string AceCat = "";
            string AceSP = "";
            string AceLD = "";
            string AceSD = "";

            string BNCCat = "";
            string BNCSP = "";
            string BNCLD = "";
            string BNCSD = "";

            var ProName = FC["ProName"];
            var ProSalePrice = FC["ProSalePrice"];
            var IsActive = FC["IsActive"];

            var DermicsCheckbox = FC["DermicsCheckbox"];
            var AceCheckbox = FC["AceCheckbox"];
            var BNCCheckbox = FC["BNCCheckbox"];

            if (ProName==null)
            {
                TempData["RequiredValues"] = "ProName";
                return RedirectToAction("Product");
            }
            if(ProSalePrice==null)
            {
                TempData["RequiredValues"] = "ProSalePrice";
                return RedirectToAction("Product");
            }

            if (DermicsCheckbox == "true")
            {
                var DermicsCategory = FC["DermicsCategory"];
                var DermicsSalePrice = FC["DermicsSalePrice"];
                var DermicsLongDescription = FC["editor1"];
                var DermicsShortDescription = FC["DermicsShortDescription"];
                if (DermicsCategory == "0")
                {
                    TempData["RequiredValues"] = "DermicsCategory";
                    return RedirectToAction("Product");
                }
                else
                {
                    DxCat = DermicsCategory;
                }
                if (DermicsSalePrice == null)
                {
                    TempData["RequiredValues"] = "DermicsSalePrice";
                    return RedirectToAction("Product");
                }
                else
                {
                    DxSP = DermicsSalePrice;
                }
                if (DermicsLongDescription == null)
                { 
                    TempData["RequiredValues"] = "DermicsLongDescription"; 
                    return RedirectToAction("Product"); 
                }
                else
                { 
                    DxLD = DermicsLongDescription; 
                }
                if (DermicsShortDescription == null)
                { 
                    TempData["RequiredValues"] = "DermicsShortDescription"; 
                    return RedirectToAction("Product"); 
                }
                else
                { 
                    DxSD = DermicsShortDescription; 
                }
            }
            if (AceCheckbox == "true")
            {
                var AceCategory = FC["AceCategory"];
                var AceSalePrice = FC["AceSalePrice"];
                var AceLongDescription = FC["editor2"];
                var AceShortDescription = FC["AceShortDescription"];

                if (AceCategory == "0")
                {
                    TempData["RequiredValues"] = "AceCategory";
                    return RedirectToAction("Product");
                }
                else
                {
                    AceCat = AceCategory;
                }
                if (AceSalePrice == null)
                {
                    TempData["RequiredValues"] = "AceSalePrice";
                    return RedirectToAction("Product");
                }
                else
                {
                    AceSP = AceSalePrice;
                }
                if (AceLongDescription == null)
                {
                    TempData["RequiredValues"] = "AceLongDescription";
                    return RedirectToAction("Product");
                }
                else
                {
                    AceLD = AceLongDescription;
                }
                if (AceShortDescription == null)
                {
                    TempData["RequiredValues"] = "AceShortDescription";
                    return RedirectToAction("Product");
                }
                else
                {
                    AceSD = AceShortDescription;
                }

            }
            if (BNCCheckbox == "true")
            {
                var BNCCategory = FC["BNCCategory"];
                var BNCSalePrice = FC["BNCSalePrice"];
                var BNCLongDescription = FC["editor3"];
                var BNCShortDescription = FC["BNCShortDescription"];

                if (BNCCategory == "0")
                {
                    TempData["RequiredValues"] = "BNCCategory";
                    return RedirectToAction("Product");
                }
                else
                {
                    BNCCat = BNCCategory;
                }
                if (BNCSalePrice == null)
                {
                    TempData["RequiredValues"] = "BNCSalePrice";
                    return RedirectToAction("Product");
                }
                else
                {
                    BNCSP = BNCSalePrice;
                }
                if (BNCLongDescription == null)
                {
                    TempData["RequiredValues"] = "BNCLongDescription";
                    return RedirectToAction("Product");
                }
                else
                {
                    BNCLD = BNCLongDescription;
                }
                if (BNCShortDescription == null)
                {
                    TempData["RequiredValues"] = "BNCShortDescription";
                    return RedirectToAction("Product");
                }
                else
                {
                    BNCSD = BNCShortDescription;
                }

            }

           
           
            
            

            var DermicsDiscountedPrice = FC["DermicsDiscountedPrice"];
            var DermicsFamilyName = FC["DermicsFamilyName"];
            var DermicsYoutubeLink = FC["DermicsYoutubeLink"];
            var DermicsIsActive = FC["DermicsIsActive"];

            var AceDiscountedPrice = FC["AceDiscountedPrice"];
            var AceFamilyName = FC["AceFamilyName"];
            var AceYoutubeLink = FC["AceYoutubeLink"];
            var AceIsActive = FC["AceIsActive"];

            var BNCDiscountedPrice = FC["BNCDiscountedPrice"];
            var BNCFamilyName = FC["BNCFamilyName"];
            var BNCYoutubeLink = FC["BNCYoutubeLink"];
            var BNCIsActive = FC["BNCIsActive"];
            //Repo.SaveProduct();
            return RedirectToAction("Product");

        }
    }
}