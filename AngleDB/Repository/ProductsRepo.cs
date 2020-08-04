using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AngleDB.Repository
{
    public class ProductsRepo
    {
        readonly AngleDBDataContext Context = new AngleDBDataContext();
        public List<TblProduct> getProductslist()
        {
            try
            {
                List<TblProduct> Productlist = Context.TblProducts.ToList();
                return Productlist;
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "ProductsRepo", "getProductslist");
                return null;
            }
        }

        public List<AceTblCategory> getAceProductsCategorylist()
        {
            try
            {
                List<AceTblCategory> Productlist = Context.AceTblCategories.Where(x => (x.AceCatIsActive == true || x.AceCatIsActive == null) && (x.AceCatIsDeleted == false || x.AceCatIsDeleted == null)).ToList();
                return Productlist;
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "ProductsRepo", "getAceProductsCategorylist");
                return null;
            }
        }
        public List<DxTblCategory> getDxProductsCategorylist()
        {
            try
            {
                List<DxTblCategory> Productlist = Context.DxTblCategories.Where(x => (x.DxCatIsActive == true || x.DxCatIsActive == null) && (x.DxIsDeleted == false || x.DxIsDeleted == null)).ToList();
                return Productlist;
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "ProductsRepo", "getAceProductsCategorylist");
                return null;
            }
        }
        public void SaveProduct(
            string Name,
            string PurchasePrice,
            bool ProdISActive,
            int DxCategory,
            string DxSalePrice,
            string DxDiscount,
            string DxFamilyName,
            string DxLongDescription,
            string DxShortDescription,
            string DxYouTubeLink,
            bool DxIsActive,
            int AceCategory,
            string AceSalePrice,
            string AceDiscount,
            string AceFamilyName,
            string AceLongDescription,
            string AceShortDescription,
            string AceYouTubeLink,
            bool AceIsActive
            )
        {
            TblProduct prod = new TblProduct();

        }
    }
}
