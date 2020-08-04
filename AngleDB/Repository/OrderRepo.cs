using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Text;
using System.Threading.Tasks;

namespace AngleDB.Repository
{
    public class OrderRepo
    {
        readonly AngleDBDataContext Context = new AngleDBDataContext();
        public List<SP_GetOrdersByPaginationResult> GetOrderByPagination(int SearchType, string SearchStr, int OffSet, int PageSize, string SortCol, string SortOrder)
        {
            List<SP_GetOrdersByPaginationResult> Orders = Context.SP_GetOrdersByPagination(searchType: SearchType, searchStr: SearchStr, offSet: OffSet, pageSize: PageSize, sortColumn: SortCol, sortOrder: SortOrder).ToList();
            return Orders;
        }
    }
}
