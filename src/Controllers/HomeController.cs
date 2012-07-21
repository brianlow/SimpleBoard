using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using SimpleBoard.Storage;

namespace SimpleBoard.Controllers
{
    public class HomeController : Controller
    {
        readonly MessageStore _messageStore = new MessageStore("Main");

        public ActionResult Index()
        {
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