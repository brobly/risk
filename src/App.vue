<template>
  <div id="app">
    <div class="container">
      <top-header></top-header>
      <div v-if="isPlayerSetup" class="popup player-setting align-items-center">
        <h5>玩家設定</h5><a class="close_button" @click="isPlayerSetup = !isPlayerSetup">X</a>
        <div class="d-flex mb-2" v-for="(player,index) of player_list" :key="'player_list'+index">
       <select style="width:60px; margin:0px 5px;" v-model="player.color">
                <option value="#0000ff">藍</option>
                <option value="#00FF00">綠</option>
                <option value="#FFFF00">黃</option>
                <option value="#000000">黑</option>
            </select>
          <input class="mr-1" type="text" placeholder="玩家名稱" v-model ="player.name">
          <button class="" @click="player_list.splice(index,1)">刪減玩家</button>
        </div>
        <button class="mt-3" @click="player_list.push({})">新增玩家</button>
        <div class="mt-3">玩家人數:{{player_list.length}}</div>
      </div>
      <div class="float-buttons">
        <a href="javascript:void(0)" @click="isPlayerSetup = !isPlayerSetup">玩家設定</a>
      </div>

      <div style="margin: 10px" class="content">
        <div class="row">
        <div class="col-6 position-relative">
          <div class="action">
            <input v-model="max" />
            <button @click="dropCard(countriesList)">抽卡</button>

            <button class="ml-1" @click="fixLimit = !fixLimit">
              {{ fixLimit ? "關閉" : "開啟" }}
            </button>
            <button class="ml-2" @click="clearMapStorage">清暫存</button>
<!-- 
            <button class="ml-2" @click="calcTotalAmount('ff')">TEST</button> -->
            
          </div>
          <div>
            <ul class="dropResult">
              <li v-for="item of dropedList" :key="item">{{ item }}</li>
            </ul>
            總共:{{ dropedList.length }}
          </div>
          <div class="colum_line"></div>
        </div>
          <div class="col-6 player_info">
            <div v-for="(player,index) of player_list" :key="'player_list2'+index">
              <div :style="{'color':player.color}" class="d-flex player_info mb-2" v-if="player.name">
                <label>{{player.name}} - </label>
                <span>結算金額：{{calcTotalAmount(player.name)}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="main pb-3">
          <ul class="map">
            <li v-for="(item, index) of mainMap" :key="'map' + index">
              <ul>
                <li
                  class="continent"
                  v-for="(value, name) of item"
                  :key="'continent' + name"
                >
                  <h5>{{ name }}:</h5>
                  <ul class="countries_wrapper">
                    <li
                      :style="[item2.owner ? {'border-color': player_list.filter(item => item.name == item2.owner)[0].color}:{'border-color':'#acacac'}]"
                      class="countries"
                      v-for="(item2, index2) of value"
                      :key="'countries' + index2"
                    >
                   
                      玩家: <select v-model="item2.owner">
                          <option value="" selected>電腦</option>
                          <option
                              v-for="(option, idx) of player_list"
                              :key="option.name + idx"
                              :value="option.name"
                            >
                              {{ option.name }}
                            </option>
                      </select>
                      
                      <div class="">
                        <p class="country">{{ item2.country }}:</p>
                        <template
                          v-if="item2.finance && item2.finance.resource"
                        >
                          <ul class="">
                            <li
                              class="product"
                              v-for="(resource, index3) of item2.finance
                                .resource"
                              :key="'product'+index3"
                            >
                              <a class="product_name" href="javascript:void(0)" @click="
                                  triggerEditPopup(resource, item2.finance.resource)
                                ">
                                {{ resource.name
                                }}
                               <span  v-if="resource.status == 1"> (
                                <img src="@/assets/images/building.svg" alt="">
                                )</span>
                               <span  v-if="resource.status == 2"> (
                                <img src="@/assets/images/fix.svg" alt="">
                                )</span>
                              </a>
                            </li>
                          </ul>
                          <p class="mt-2 product_amount">
                            值:<span class="">{{
                              totalAmount(item2.finance.resource)
                            }}</span>
                          </p>
                          <div class="country_options">
                            <ul class="country_options_wrapper">
                              <li
                                @click="addProduct(item2.finance.resource)"
                                class="mt-2 country_options_list"
                              >
                                增加資源
                              </li>
                            
                              <li
                                @click="
                                  triggerRemovePopup(item2.finance.resource)
                                "
                                class="mt-2 country_options_list"
                              >
                                刪除資源
                              </li>
                            </ul>
                          </div>
                        </template>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <div
            v-if="
              isEdit ||
              isAddSuccess ||
              isEditSuccess ||
              isRemoveSuccess ||
              isRemove
            "
            class="popup-background"
          ></div>
          <div v-if="isEdit" class="popup popup-edit-product">
            <div class="popup-header">修改狀態</div>
            <div class="popup-body d-flex">
              <select v-model="editProObj.product" class="ml-1 product-select">
                <option
                  v-for="(item, index) of popupOptions"
                  :key="555 + item + index"
                  :value="item.name"
                >
                  {{ item.name }}
                </option>
              </select>
              <select v-model="editProObj.status" class="ml-1">
                <option
                  v-for="(item, index) of statusOptions"
                  :key="'edit' + item + index"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>
            <div class="popup-footer">
              <div class="d-flex button-list">
                <button @click="editProduct(popupOptions)">提交</button>
                <button @click="isEdit = !isEdit">取消</button>
              </div>
            </div>
          </div>
          <div v-if="isRemove" class="popup popup-remove-product">
            <div class="popup-header">刪除資源</div>
            <div class="popup-body d-flex">
              <select v-model="removePro" class="ml-1 product-select">
                <option
                  v-for="(item, index) of popupOptions"
                  :key="'remove' + item + index"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>
            <div class="popup-footer">
              <div class="d-flex button-list">
                <button @click="removeProduct(popupOptions)">提交</button>
                <button @click="isRemove = !isRemove">取消</button>
              </div>
            </div>
          </div>

          <div v-if="isSuccess" class="popup popup-success">
            <div class="popup-large" v-if="isAddSuccess">增加成功</div>
            <div class="popup-large" v-if="isEditSuccess">修改成功</div>
            <div class="popup-large" v-if="isRemoveSuccess">刪除成功</div>
          </div>
        </div>
      </div>
      <!-- <component :is="d"></component> -->
    </div>
  </div>
</template>

 <!--     {{pro}}
                <select class="ml-1" v-model="pro" >
                    <option value="稻">稻</option>
                    <option value="羊">羊</option>
                    <option value="石">石</option>
                    <option value="磚">磚</option>
                    <option value="木">木</option>
                    <option value="礦場">礦場</option>
                </select>
 
  -->
<script>
import topHeader from "./layout/topHeader.vue";

export default {
  name: "App",
  components: {
    topHeader,
  },
  data() {
    return {
      max: 0,
      fixLimit: false,
      pro: "稻",
      setup: true,
      isEdit: false,
      isRemove: false,
      isSuccess: false,
      isAddSuccess: false,
      isEditSuccess: false,
      isRemoveSuccess: false,
      isPlayerSetup:false,
      popupOptions: [],
      statusOptions: [
        { id: 1, name: "已建造" },
        { id: 2, name: "待維修" },
        { id: 3, name: "" },
      ],
      editProObj: {},
      removePro: "",
      player_list:[{}],
      mainMap: [
        {
          北美洲: [
            { country: "阿拉斯加", building: [], finance: { resource: [] }, owner : "" },
            { country: "西北地區", building: [], finance: { resource: [] }, owner : "" },
            { country: "艾伯塔", building: [], finance: { resource: [] }, owner : "" },
            { country: "安大略", building: [], finance: { resource: [] }, owner : "" },
            { country: "魁北克", building: [], finance: { resource: [] }, owner : "" },
            { country: "格陵蘭", building: [], finance: { resource: [] }, owner : "" },
            { country: "美國西部", building: [], finance: { resource: [] }, owner : "" },
            { country: "美國東部", building: [], finance: { resource: [] }, owner : "" },
            { country: "中美洲", building: [], finance: { resource: [] }, owner : "" },
          ],
        },
        {
          南美洲: [
            { country: "委內瑞拉", building: [], finance: { resource: [] }, owner : "" },
            { country: "巴西", building: [], finance: { resource: [] }, owner : "" },
            { country: "秘魯", building: [], finance: { resource: [] }, owner : "" },
            { country: "阿根廷", building: [], finance: { resource: [] }, owner : "" },
          ],
        },
        {
          非洲: [
            { country: "北非", building: [], finance: { resource: [] }, owner : "" },
            { country: "埃及", building: [], finance: { resource: [] }, owner : "" },
            { country: "東非", building: [], finance: { resource: [] }, owner : "" },
            { country: "剛果", building: [], finance: { resource: [] }, owner : "" },
            { country: "南非", building: [], finance: { resource: [] }, owner : "" },
            { country: "馬達加斯加", building: [], finance: { resource: [] }, owner : "" },
          ],
        },
        {
          歐洲: [
            { country: "冰島", building: [], finance: { resource: [] }, owner : "" },
            { country: "英國", building: [], finance: { resource: [] }, owner : "" },
            { country: "西歐", building: [], finance: { resource: [] }, owner : "" },
            { country: "北歐", building: [], finance: { resource: [] }, owner : "" },
            { country: "南歐", building: [], finance: { resource: [] }, owner : "" },
            { country: "烏克蘭", building: [], finance: { resource: [] }, owner : "" },
            {
              country: "斯堪的那維亞",
              building: [],
              finance: { resource: [] },
            },
          ],
        },
        {
          亞洲: [
            { country: "中東", building: [], finance: { resource: [] }, owner : "" },
            { country: "阿富汗", building: [], finance: { resource: [] }, owner : "" },
            { country: "印度", building: [], finance: { resource: [] }, owner : "" },
            { country: "中國", building: [], finance: { resource: [] }, owner : "" },
            { country: "蒙古", building: [], finance: { resource: [] }, owner : "" },
            { country: "伊爾庫次克", building: [], finance: { resource: [] }, owner : "" },
            { country: "烏拉", building: [], finance: { resource: [] }, owner : "" },
            { country: "雅庫次克", building: [], finance: { resource: [] }, owner : "" },
            { country: "日本", building: [], finance: { resource: [] }, owner : "" },
            { country: "堪斯加半島", building: [], finance: { resource: [] }, owner : "" },
            { country: "西伯利亞", building: [], finance: { resource: [] }, owner : "" },
            { country: "暹羅", building: [], finance: { resource: [] }, owner : "" },
          ],
        },
        {
          澳洲: [
            { country: "印度尼西亞", building: [], finance: { resource: [] }, owner : "" },
            { country: "新幾內亞", building: [], finance: { resource: [] }, owner : "" },
            { country: "西澳洲", building: [], finance: { resource: [] }, owner : "" },
            { country: "東澳洲", building: [], finance: { resource: [] }, owner : "" },
          ],
        },
      ],
      factory:[
          {
              '稻':{
                  buy:700,
                  sell:400,
                  product:[
                      {'稻':200}
                  ]
              },
              '羊':{
                  buy:700,
                  sell:400,
                  product:[
                      {'羊':200}
                  ]
              },
              '石':{
                  buy:700,
                  sell:400,
                  product:[
                      {'石':200}
                  ]
              },
              '木':{
                  buy:700,
                  sell:400,
                  product:[
                      {'木':200}
                  ]
              },
              '磚':{
                   buy:700,
                  sell:400,
                  product:[
                      {'磚':200}
                  ]
              },
              '礦場':{
                  buy:1500,
                  sell:1000,
                  product:[
                      {'鐵':200},
                      {'黃金':400},
                      {'紅寶':600},
                      {'藍寶':600},
                      {'翡翠':900},
                      {'鑽石':1200},
                  ]
              },
          }
      ],
      dropedList: [],
      product_list: ["稻", "羊", "石", "磚", "木", "礦"],
    };
  },
  computed: {
    // 洲
    continentList() {
      return this.mainMap.map((item) => {
        console.log(Object.keys(item)[0]);
        return Object.keys(item)[0];
      });
    },
    // 國家
    countriesList() {
      let newList = [];
      this.mainMap.forEach((item, index) => {
        item[this.continentList[index]].forEach((item2) => {
          newList.push(item2.country);
        });
      });
      return newList;
    },
  },
  methods: {
    // 隨機數目
    randomList(arr) {
      function func() {
        return 0.5 - Math.random();
      }
      return arr.sort(func);
    },
    // 隨機數目根據上限
    randomLimit(max) {
      return Math.floor(Math.random() * max + 1);
    },
    // 增加強盜
    addRobber(arr) {
      let list = arr.map((item) => item);
      function randomNum(list) {
        let random = Math.floor(Math.random() * (list.length - 1) + 1);
        if (random == 42) random = 0;
        list[random] = list[random] + " (強盜)";
      }
      for (var i = 0; i < 1; i++) {
        randomNum(list);
      }
      return list;
    },
    // 抽卡
    dropCard(arr) {
      let ranlist = this.randomList(arr);

      if (!this.setup) ranlist = this.addRobber(ranlist);
      this.dropedList = ranlist.slice(
        0,
        this.fixLimit ? this.max : this.randomLimit(this.max)
      );
      if (this.setup) this.setupResource();
    },
    // 設定資源
    setupResource() {
      this.mainMap.forEach((item, index) => {
        const obj = item[this.continentList[index]];
        obj.forEach((item2) => {
          this.dropedList.forEach((item3,index2) => {
            if (item3 == item2.country) {
              item2["finance"].resource.push({id:item3+index2, name: this.pro, status: 3 });
            }
          });
        });
      });
    },
    // 設定地圖
    setUpMap() {
      this.max = 21;
      this.product_list.forEach((item) => {
        if (item == "礦") {
          this.max = 12;
        }
        this.pro = item;
        this.dropCard(this.countriesList);
      });

      this.max = 3;
      this.fixLimit = true;
      this.pro = "寶藏";
      this.dropCard(this.countriesList);

      this.max = 0;
      this.fixLimit = false;
      this.setup = false;

    },
    // 計算地區總值
   totalAmount(list) {
      const countBuild = list.filter((item2) => item2.status == 1).length;
      return list.length * 50 + 50 + countBuild * 100;
    },
    // 顯示資源修改
    triggerEditPopup(item,array) {
      this.isEdit = true;
        this.editProObj = {
          product: item.name,
          status: item.status,
        };
      this.popupOptions = array;
    },
    // 顯示資源刪除
    triggerRemovePopup(item) {
      this.isRemove = true;
      this.removePro = item[0];
      this.popupOptions = item;
    },
    // 確定資源修改
    editProduct(array) {
      array.forEach((item) => {
        if (this.editProObj.product == item.name) {
          item.status = this.editProObj.status;
        }
      });
      this.isEditSuccess = true;
      this.isSuccess = true;
      setTimeout(() => {
        this.isEdit = false
        this.isSuccess = false;
        this.isEditSuccess = false;
      }, 500);
    },
    // 確定資源增加
    addProduct(array) {
      let newList = [...this.product_list];
      console.log("array", array);
      let resourceArray = array.map((item) => item.name);

      newList = newList.filter(function (val) {
        return resourceArray.indexOf(val) == -1;
      });
      newList = this.randomList(newList);

      if (resourceArray.length < 5) {
        array.push({ name: newList[0], status: 3 });

        this.isAddSuccess = true;
        this.isSuccess = true;
        setTimeout(() => {
          this.isSuccess = false;
          this.isAddSuccess = false;
        }, 500);
      }
    },
    // 確定資源刪除
    removeProduct(array) {
      let resourceArray = array.map((item) => item.name);
      resourceArray.forEach((element, index) => {
        if (element == this.removePro.name) {
          array.splice(index, 1);
        }
      });
      this.isRemoveSuccess = true;
      this.isSuccess = true;
      setTimeout(() => {
        this.isRemove = false;
        this.isSuccess = false;
        this.isRemoveSuccess = false;
      }, 500);
    },
    clearMapStorage(){
       localStorage.clear();
    },
    setColor(item){
      if( this.player_list && this.player_list[0].name){
        return this.player_list.filter((list)=>list.name == item)[0].color
      }else{
         return null
      }
    },
    calcTotalAmount(key){
      // let countAmount = 0
      let newList = this.mainMap.map((item, index) => {
        const obj = item[this.continentList[index]];
        return obj.filter((item2) => item2.owner == key );
      });
      const amount = newList.flat(1).reduce(
          (accumulator, currentValue) => accumulator + this.totalAmount(currentValue.finance.resource),
          0
        );
        return amount
    }
  },
  mounted() {
    if (localStorage.map) {
      this.mainMap = JSON.parse(localStorage.map);
    }else{
      this.setUpMap();
    }
    if (localStorage.player) {
      this.player_list = JSON.parse(localStorage.player);
    }
  },
  watch: {
    mainMap: {
      handler(newValue) {
        localStorage.setItem("map", JSON.stringify(newValue));
      },
      deep: true,
    }, 
    player_list: {
      handler(newValue) {
        localStorage.setItem("player", JSON.stringify(newValue));
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
body{
 background: #ededed
}
.ml-2{
  margin-left:2rem;
}
.ml-1{
  margin-left:1rem;
}
.container{
  position: relative;
}
.float-buttons{
  position: absolute;
  right:0px;
  top:50px;
}

.dropResult {
  margin-top: 10px;
}
.continent {
  margin-top: 10px;
  border: 1px solid #858585;
  padding: 20px;
}
.countries_wrapper {
  display: flex;
  flex-wrap: wrap;
}
.countries {
    margin: 20px;
    width: 15%;
    padding: 10px;
    border: 3px solid #acacac;
    position: relative;
}
.country {
  font-size: 19px;
  font-weight: bold;
  color: #5d7a94;
}
.product_name {
  color: #659d65;
  img{
    width:16px;
  }
}

.product_amount {
  color: #257ebd;
}
.action input {
  max-width: 200px;
}

.popup-background {
  z-index: 2;
  background: #444a;
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0px;
  left: 0px;
}
.popup {
  z-index: 3;
  background: rgb(227 225 211);
  position: fixed;
  overflow: hidden;
  max-height: 250px;
  max-width: 450px;
  padding:2rem;
  height: 90%;
  width: 90%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  &.player-setting{
    max-height: 100vh;
    min-height: 250px;
    height: auto;
  }
  select {
    margin: 10px auto;
    padding: 0.5rem;
    width: 80%;
  }
}
.popup-header {
  padding: 1rem 1.5rem;
  font-size: 18px;
}
.popup-large {
  font-size: 28px;
  text-align: center;
  line-height: 250px;
}

.popup-edit-product select {
  flex: 0 0 45%;
  max-width: 45%;
}
.close_button{
  cursor:pointer;
  color:#0000ff;
  position: absolute;
  right: 20px;
  top: 20px;
}

.button-list {
  margin-top: 10px;
  justify-content: center;
  button {
    padding: 0.2rem 1.5rem;
    margin: 0 10px;
  }
}

.country_options {
  width: 100px;
}
.color-input{
  width: 100px;
}
.player_info{

}
.colum_line{
    width: 1px;
    border-left: 1px dashed #33dfca;
    display: flex;
    flex-direction: column;
    position: absolute;
    height: 100%;
    right: 0px;
    top: 0px;
}
*{
  text-shadow: -1px 1px 2px #ad9292;
}
@media screen and (max-width: 575px) {
  .countries {
    margin: 20px 0;
    width: 50%;
  }
}
</style>
