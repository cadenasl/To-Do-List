//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const_ =require("lodash");
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

console.log(process.env.DB_USER);
mongoose.connect('mongodb+srv://'+ (process.env.DB_USER)+':'+ (process.env.DB_PASS)+ '@cluster0.bueqi.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({item:{type:String, required:true}});

const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({item:"homework"});
const item2= new Item({item:"workout"});
const item3 = new Item({item:"clean"});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items:[itemsSchema]

};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if (foundItems.length ===0){
    Item.insertMany(defaultItems,function(err){if(err){console.log(err);}
  else{console.log("it was successful");}});
res.redirect("/");
}
  else{res.render("list", {listTitle: "Today", newListItems: foundItems});}}





);


});

app.get("/:customListName",function(req,res){
  const customListName =_.capitalize( req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {if(!foundList){
      // create a new list
      const list = new List({
        name: customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);

    }else{
      //show an existing list
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
    }

  }});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({item:itemName});

  if (listName==="Today"){

item.save();
res.redirect("/");
}else{

  List.findOne({name:listName}, function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
}});



app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;
  if (listName==="Today"){

  Item.findByIdAndRemove({ _id: checkedItemId}, function (err) {if(!err){console.log("successful deleted item");
res.redirect("/");}
})
}
   else{

    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
})
}
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
