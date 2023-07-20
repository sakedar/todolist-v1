const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-saketh:saketh143@cluster0.51tqy5d.mongodb.net/todolistDB');
  console.log("Connected");
}
const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome"
});

const item2 = new Item ({
  name: "Add Item"
});

const item3 = new Item ({
  name: "Delete Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", async function(req, res) {

  await Item.find().then(function(foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function(){
      console.log("Items Inserted.");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  }).catch(function(err){
    console.log(err);
  });
});

app.get("/:customListName", async function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  await List.findOne({name:customListName}).then(function(foundList){
    if(!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
        list.save();
        res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  }).catch(function(err){
    console.log(err);
  })

});

app.post("/",async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({name: listName}).exec().then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    });
  };

  // if (req.body.list === "Work List") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //     items.push(item);
  //     res.redirect("/");
  // }

});

app.post("/delete", async function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItem).then(function(){
      console.log("succesfully removed");
      res.redirect("/");
    }).catch(function(err){
      console.log(err);
    });
  } else {
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}).then(function(){
        res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    });
  };

});


//Work Route



app.post("/work", function(req, res) {
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

//About Route

app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
