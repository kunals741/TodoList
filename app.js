//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//moongose db:
mongoose.connect("mongodb+srv://admin-kunal:Drake@mong741@cluster0.q755n.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

//schema:
const itemSchema = {
  name: String
};

//model:
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome"
});
const item2 = new Item({
  name: "Use + to add"
});
const item3 = new Item({
  name: "<- Hit this to remove"
});

const defaultItems = [item1, item2, item3];

//custom list schmea:
const listSchema = {
  name : String,  //name of custom list
  items : [itemSchema]  //arrays of itemschema type
};
//model of above list schema:
const List = mongoose.model('List', listSchema);





// home route:
app.get("/", function (req, res) {
  
  //printing all the items:
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully added to db");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});
// routing parameters for any custom list:
app.get("/:list", function (req, res) {
  const customList = _.capitalize(req.params.list);
  List.findOne({name : customList}, function(err,results){
    if(!err){
      if(!results){
        const list = new List({
          name : customList,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customList)
      }else{
        res.render("list", { listTitle: results.name, newListItems: results.items });
      }
    }
  });
 
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  
  const item4 = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item4.save();
  res.redirect("/");

  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete", function (req, res) {
  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(deleteItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully removed from DB");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
});



app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server started on port 3000");
});
