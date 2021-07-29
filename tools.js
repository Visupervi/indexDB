/**
 * @author Visupervi
 * @description 拍平带有children的数组
 * @param {*} arr 
 * @param {*} tempArr 
 * @returns {*} tempArr
 */
const flatArr = (arr, tempArr = []) => {
  for(let i = 0; i < arr.length; i++) {
    tempArr.push(arr[i]);
    if(arr[i].children.length > 0) {
      flatArr(arr[i].children);
    }
  }
  return tempArr;
}

/**
 * @description 解决安卓手机键盘弹出遮盖问题
 */
const inputUp = () => {
  //安卓机型，自动上滑露出输入框
  if (/Android/.test(navigator.appVersion)) {
    window.addEventListener("resize", () => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement._prevClass === 'van-field_control') {
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
          document.activeElement.tagName.scrollIntoView({behavior: "instant", block: "start", inline: "start"});
        } else {
          document.querySelector('.header').scrollIntoView({behavior: "instant", block: "start", inline: "start"});
          document.querySelector('.breakThrough').scrollIntoView({behavior: "instant", block: "start", inline: "start"});
        }
      }
    })
  }
};

/**
 * @description 封装fetch请求
 * 这里需要使用下面这种方式中断请求
 */
//  const controller = new AbortController();
//  const signal = controller.signal;
//  fetch('https://somewhere', { signal })
//  controller.abort()
const fetchOrAjax = async (url = "", data = {}, type = "GET", method = "fetch") => {
  if (type.toLocaleLowerCase() === "get") {
    let str = "";
    Object.keys(data).map((item, index) => {
      str += item + '=' + data[item] + '&';
    });
    if (str !== "") {
      str = str.substr(0, str.lastIndexOf("&"));
      url = url + "?" + str;
    }
  }

  if (window.fetch && method === "fetch") {
    let requestConfig = {
      credentials: 'include',
      method: type,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: "cors",
      cache: "force-cache"
    };
    if (type.toLocaleLowerCase() === "post") {
      Object.defineProperty(requestConfig, 'body', {
        value: JSON.stringify(data)
      });
    }

    try {
      const response = await fetch(url, requestConfig);
      return await response.json();
    } catch (e) {
      throw new Error(e)
    }
  } else {
    return new Promise(((resolve, reject) => {
      let reqObj = !window.XMLHttpRequest ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
      let sendData = "";
      if (type.toLowerCase() === "post") {
        sendData = JSON.stringify(data);
      }
      reqObj.open(type, url, true);
      reqObj.setRequestHeader("Content-type", "application/json");
      reqObj.send(sendData);

      reqObj.onreadystatechange = () => {
        if (reqObj.readyState === 4) {
          if (reqObj.status === 200) {
            resolve(JSON.parse(reqObj.response));
          }
        } else {
          reject(reqObj.response);
        }
      }
    }))
  }
}


/**
 * @param {*} date 
 * @returns 格式化以后的日期，yyyy-MM-DD
 * @description formatTime(new Date("2021/09/12 12:09:00")) / formatTime(new Date())
 */
const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};
// 初始化数字
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * @description 获取当前月的第一天
 * @returns 获取当前月的第一天
 */
const getCurrentMonthFirst = () => {
  let date = new Date();
  date.setDate(1);
  let month = parseInt(date.getMonth() + 1);
  let day = date.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return date.getFullYear() + '-' + month + '-' + day;
};


/**
 * @description 获取当前月最后一天
 * @returns 获取当前月最后一天
 */
const getCurrentMonthLast = () => {
  let date = new Date();
  let currentMonth = date.getMonth();
  let nextMonth = ++currentMonth;
  let nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
  let oneDay = 1000 * 60 * 60 * 24;
  let lastTime = new Date(nextMonthFirstDay - oneDay);
  let month = parseInt(lastTime.getMonth() + 1);
  let day = lastTime.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return date.getFullYear() + '-' + month + '-' + day;
};
export default {
  fetchOrAjax,
  formatTime,
  getCurrentMonthFirst,
  getCurrentMonthLast,
  inputUp,
  flatArr
}