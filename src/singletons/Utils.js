class Utils {
    constructor() {
      if (!Utils.instance) {
        //this._data = "http://154.56.43.220:8080";
        //this._data_ws = "ws://154.56.43.220:8080";
        this._data = "http://192.168.2.101:8080";
        this._data_ws = "ws://192.168.2.101:8080";
        Utils.instance = this;
      }
  
      return Utils.instance;
    }
  
    getData(path) {
      return this._data + path;
    }

    getDataWs(path) {
        return this._data_ws + path;
    }
  }
  
  const instance = new Utils();
  Object.freeze(instance);
  
  export default instance;