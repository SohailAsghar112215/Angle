using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Diagnostics;
using System.Threading.Tasks;

namespace AngleDB.Repository
{
    public class UtilityClasses
    {
    }
    public static class Country
    {
        public static List<TblCountry> GetCountryList()
        {
            AngleDBDataContext context = new AngleDBDataContext();
            return context.TblCountries.OrderBy(x => x.name).ToList();
        }
        public static List<TblState> GetStateList(int id)
        {
            AngleDBDataContext context = new AngleDBDataContext();
            return context.TblStates.Where(x => x.country_id == id).OrderBy(x => x.name).ToList();
        }
        public static List<TblCity> GetCityList(int id)
        {
            AngleDBDataContext context = new AngleDBDataContext();
            return context.TblCities.Where(x => x.state_id == id).OrderBy(x => x.name).ToList();
        }
    }
    public static class CustDateTime
    {
        public static DateTime getCurrentDate()
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("Korea Standard Time");
            DateTime dateTime = TimeZoneInfo.ConvertTime(DateTime.Now, timeZoneInfo);
            return Convert.ToDateTime(dateTime.ToString("yyyy-MM-dd"));
        }
        public static string GetCurrentDateString()
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("Korea Standard Time");
            DateTime dateTime = TimeZoneInfo.ConvertTime(DateTime.Now, timeZoneInfo);
            return dateTime.ToString("yyyy-MM-dd").Replace("-", "");
        }

        public static DateTime GetCurrentDateTime()
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("Korea Standard Time");
            //Get date and time in Korea Standard Time
            DateTime dateTime = TimeZoneInfo.ConvertTime(DateTime.Now, timeZoneInfo);
            string dtString = dateTime.ToString("MM/dd/yyyy HH:mm:ss");
            return DateTime.ParseExact(dtString, "MM/dd/yyyy HH:mm:ss", null);
        }
    }
    public static class UserSideLog
    {
        public static void WriteGeneralLog(string Server_Url, string Ip, int Uid, string UserIdentity)
        {
            try
            {
                AngleDBDataContext context = new AngleDBDataContext();
                TblLog log = new TblLog
                {
                    Datetime = CustDateTime.GetCurrentDateTime(),
                    Server_Url = Server_Url,
                    Ip = Ip,
                    UserIdentity = UserIdentity,
                    User_Id = Uid,
                    Website = "Dx"
                };
                context.TblLogs.InsertOnSubmit(log);
                context.SubmitChanges();
            }
            catch (Exception ex)
            {
                ExceptionLog.WriteException(ex, "UserSideLog", "WriteGeneralLog", Uid, Server_Url, Ip, UserIdentity);
            }
        }
    }
    public static class ExceptionLog
    {
        public static void WriteGeneralException(string Controller, string Method, int Uid, String Values, string Type = "Exception")
        {
            try
            {
                var mth = new StackTrace().GetFrame(1).GetMethod();
                Controller = Controller + " / " + mth.ReflectedType.Name;
                Method = Method + " / " + mth.Name;
                AngleDBDataContext context = new AngleDBDataContext();
                TblException Ex = new TblException
                {
                    Controller = Controller,
                    Method = Method,
                    DateTime = CustDateTime.GetCurrentDateTime(),
                    TypeName = Type,
                    Message = "Custome Error Occur",
                    C_Id = Uid,
                    StackTrace = Values,
                    Website = "Dx"
                };
                context.TblExceptions.InsertOnSubmit(Ex);
                context.SubmitChanges();
            }
            catch (Exception ex1)
            {
                WriteExceptionInFile(ex1, "UtilityClass", "WriteException");
            }
        }
        public static void WriteException(Exception ex, string Controller, string Method, int Uid = 0, string ServerURl = "", string Ip = "", string UserIdentity = "", string Parameters = "")
        {
            try
            {
                var mth = new System.Diagnostics.StackTrace().GetFrame(1).GetMethod();
                Controller = Controller + " / " + mth.ReflectedType.Name;
                Method = Method + " / " + mth.Name;
                AngleDBDataContext context = new AngleDBDataContext();
                //string na = this.GetType().Name;
                while (ex != null)
                {
                    TblException Ex = new TblException
                    {
                        Controller = Controller,
                        Method = Method,
                        DateTime = CustDateTime.GetCurrentDateTime(),
                        TypeName = ex.GetType().FullName,
                        Message = ex.Message,
                        StackTrace = Parameters == "" ? ex.StackTrace : Parameters,
                        C_Id = Uid,
                        ServerUrl = ServerURl,
                        Ip = Ip,
                        userIdentity = UserIdentity,
                        Website = "Dx"
                    };
                    ex = ex.InnerException;
                    context.TblExceptions.InsertOnSubmit(Ex);
                }
                context.SubmitChanges();
            }
            catch (Exception ex1)
            {
                WriteExceptionInFile(ex, Controller, Method);
                WriteExceptionInFile(ex1, "UtilityClass", "WriteException");
            }
        }
        static void WriteExceptionInFile(Exception ex, string Controller, string Method)
        {
            
            try
            {
                string filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"LogFiles\Error.txt");
                File.SetAttributes(filePath, FileAttributes.Normal);
                using (StreamWriter writer = new StreamWriter(filePath, true, Encoding.ASCII))
                {
                    writer.WriteLine("-----------------------------------------------------------------------------");
                    writer.WriteLine("Date : " + CustDateTime.GetCurrentDateTime());
                    writer.WriteLine();

                    while (ex != null)
                    {
                        writer.WriteLine("Controller : " + Controller);
                        writer.WriteLine("Method : " + Method);
                        writer.WriteLine(ex.GetType().FullName);
                        writer.WriteLine("Message : " + ex.Message);
                        writer.WriteLine("StackTrace : " + ex.StackTrace);
                        ex = ex.InnerException;
                    }
                }
            }
            catch (Exception)
            {

            }

        }
    }

}
