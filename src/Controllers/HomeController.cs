using System.Web.Mvc;
using SimpleBoard.Domain;

namespace SimpleBoard.Controllers
{
    public class HomeController : Controller
    {
        private readonly MessageStore _messageStore = new MessageStore("Main");

        public ActionResult Index()
        {
            ViewBag.IsDebug = (Request.Url.Host == "localhost" && Request.Url.Port == 1099);
            return View();
        }

        [HttpPost]
        public ActionResult SendMessage(string msg)
        {
            _messageStore.Add(msg);
            return Content("");
        }
    }
}