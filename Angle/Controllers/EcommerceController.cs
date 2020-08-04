using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AngleDB;
using AngleDB.Repository;
namespace Angle.Controllers
{
    public class EcommerceController : Controller
    {
        readonly OrderRepo OrRepo = new OrderRepo();
        public ActionResult EcommerceOrders()
        {
            return View();
        }
        public ActionResult EcommerceOrderView()
        {
            return View();
        }
        public ActionResult EcommerceProducts()
        {
            return View();
        }
        public ActionResult EcommerceProductView()
        {
            return View();
        }
        public ActionResult EcommerceCheckout()
        {
            return View();
        }
        [HttpPost]
        public ActionResult LoadOrders()
        {
            var Draw = Request.Form.GetValues("draw").FirstOrDefault();
            var start = Request.Form.GetValues("start").FirstOrDefault();
            var filter = Request.Form.GetValues("search[value]").FirstOrDefault();
            var filterType = Request.Form.GetValues("OrderType").FirstOrDefault();
            //if (((TblUser)Session["LoginUser"]).id == 24 && filterType != "4")
            //{
            //    filterType = "4";
            //}
            var length = Request.Form.GetValues("length").FirstOrDefault();
            var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
            var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();
            int pageSize = length != null ? Convert.ToInt32(length) : 0;
            int skip = start != null ? Convert.ToInt32(start) : 0;
            filter = filter == "" ? null : filter;
            
            List<SP_GetOrdersByPaginationResult> Order = OrRepo.GetOrderByPagination(int.Parse(filterType), filter, skip, pageSize, sortColumn, sortColumnDir);

            int totalRecords = Order.Count > 0 ? Order.FirstOrDefault().TotalCount.Value : 0;
            //var data = Order.Skip(skip).Take(pageSize).ToList();
            return Json(new { draw = Draw, recordsFiltered = totalRecords, recordsTotal = totalRecords, data = Order }, JsonRequestBehavior.AllowGet);
        }
    }
}