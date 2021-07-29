// 是否支持indexDB
const isSupportIndexDB = () => {
  return !window.indexedDB;
};

// 创建数据库
const createDataBase = (DataBaseName, version) => {
  return window.indexedDB.open(DataBaseName, version);
};

// 成功操作函数
const success = (db, msg, cb) => {
  db.onsuccess = function (event) {
    console.log(msg);
    cb(event);
  };
};

// 失败操作函数
const error = (db, msg, cb) => {
  db.onerror = function (event) {
    // 错误处理
    console.log(msg);
    cb(event);
  };
};
// 打开事务
const getObjectStore = async (db, storeName, mode) => {
  const tx = await db.transaction([storeName], mode);
  return tx.objectStore(storeName);
}
// 创建表操作
/**
 * @description 创建表的操作
 * @param {*} db 创建的indexDB对象
 * @param {*} tableName 表的名字
 * @param {*} key 唯一标识符
 * @param {*} isAutoIncrement 是否自动生成键
 * @param {*} options 需要的表字段
 */
const createTable = (db, tableName, key, isAutoIncrement, options) => {
  db.onupgradeneeded = function (event) {
    console.log("创建表");
    db = event.target.result;
    let objectStore = null;
    if (!db.objectStoreNames.contains(tableName)) {
      objectStore = db.createObjectStore(tableName, { keyPath: key, autoIncrement: isAutoIncrement });
      // unique name可能会重复
      // 创建索引
      Object.keys(options).map(item => {
        objectStore.createIndex(options[item], options[item], { unique: options["isUnique"] });
      })
    }
  }
};

/**
 * @description 添加数据｜更新数据
 * @param {*} db :indexDb  数据库对象
 * @param {*} tableName :String数据表名称
 * @param {*} mode :String操作数据权限 readonly ｜ readwrite
 * @param {*} data :Array 需要插入的数据
 */
const insertData = async (db, tableName, mode, data) => {
  return new Promise(((resolve, reject) => {
    let request = getObjectStore(db, tableName, mode);
    data.map(item => {
      request.put(item);
    });
    success(request, "数据写入成功", async () => {
      const res = {
        status: "success",
        message: "数据写入成功",
        count: data.length
      }
      await resolve(res);
    })

    error(request, "数据写入失败", async () => {
      const res = {
        status: "failed",
        message: "数据写入失败",
        count: 0
      }
      await reject(res);
    })
  }))
};


// 删除数据

const deleteData = async (db, tableName, mode, key) => {
  return new Promise(((resolve, reject) => {
    const request = getObjectStore(db, tableName, mode);
    const result = request.delete(key);
    success(result, "删除成功", async () => {
      const res = {
        status: "success",
        message: "数据删除成功",
        count: 1
      };
      await resolve(res)
    });
    error(result, "删除失败", async () => {
      const res = {
        status: "failed",
        message: "数据删除失败",
        count: 0
      };
      await reject(res)
    });
  }))

};

// 在知道key值的时候查询数据


const selectData = async (db, tableName, mode, key) => {
  let result = await getObjectStore(db, tableName);
  let request = result.get(key);
  error(request, "查询失败", () => {
    return {
      status: "failed",
      message: "查询失败",
      data: result.get(key).result
    }
  })
  success(request, "查询成功", () => {
    return {
      status: "success",
      message: "查询成功",
      data: result.get(key).result
    };
  });
};

// 使用游标查询对象的所有的值

/**
 * @author Visupervi
 * @param {*} db
 * @param {*} dataBaseName
 * @param {*} mode
 * @returns
 */
const selectDataList = async (db, dataBaseName, mode) => {
  return new Promise(((resolve, reject) => {
    const store = getObjectStore(db, dataBaseName, mode);
    const result = store.openCursor();  //  打开一个游标
    const data = [];
    success(result, "成功打开游标", async (e) => {
      const cursor = e.target.result;
      if (cursor && cursor !== null) {
        const problem = cursor.value;
        const jsonStr = JSON.stringify(problem);
        data.push(problem);
        cursor.continue();
      } else {
        console.log('indexDb 一张表数据查询结果为：');
        // console.log(data);
        await resolve(data)
      }
    });
    error(result, "操作失败", () => {
      reject()
    })
  }))

}

export default {
  selectDataList: selectDataList,
  selectData: selectData,
  createDataBase: createDataBase,
  createTable: createTable,
  deleteData: deleteData,
  insertData: insertData,
  isSupportIndexDB: isSupportIndexDB
}
