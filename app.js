import express from "express";
import bodyparser from "body-parser";
import pg from "pg";

const app = new express();
const port  = 3000;

const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "av_voting",
  password : "101010",
  port : 5432,
});

db.connect();

app.use(bodyparser.urlencoded( { extended : true } ));
app.use(express.static("public"));

app.get("/", async (req,res)=>{

    const result = await db.query("SELECT SUM(vote) FROM (SELECT * FROM campus_lead UNION ALL SELECT * FROM vote_batch_2 UNION ALL SELECT * FROM vote_batch_3 UNION ALL SELECT * FROM vote_batch_4 UNION ALL SELECT * FROM vote_batch_5 UNION ALL SELECT * FROM vote_batch_6) as sum");
    var totalVotes = result.rows[0];
    // console.log(totalVotes)
    var percent = Math.floor((totalVotes.sum*100)/(6*123))

    const resultdata = await db.query("SELECT * FROM campus_lead UNION ALL SELECT * FROM vote_batch_2 UNION ALL SELECT * FROM vote_batch_3 UNION ALL SELECT * FROM vote_batch_4 UNION ALL SELECT * FROM vote_batch_5 UNION ALL SELECT * FROM vote_batch_6 ORDER BY vote DESC");

  res.render("index1.ejs",{title :"Arabic Village Election 2024", totalVotes : totalVotes.sum, percent : percent,
      resultData : resultdata.rows
  }); 
})



app.get("/voteb:id", async (req,res)=>{ 

  const id = req.params.id;
  var tbName = "vote_batch_"+id;
  try {
    const result = await db.query("SELECT * from "+tbName+" ORDER BY id"); 
    // console.log(result.rows);
    res.render("voting.ejs",{title :"الإنتخاب القرية العربية - ٢٠٢٤", candidates : result.rows , bnumber : id});    
  } catch (error) {
    console.log(error)
  }   
})
app.get("/camplead", async (req,res)=>{

  try {
    const result = await db.query("SELECT * from campus_lead ORDER BY id");
    // console.log(result.rows);
    res.render("votingcamp.ejs",{title :"الإنتخاب القرية العربية - ٢٠٢٤", candidates : result.rows}); 
  } catch (error) {
    console.log(error)
  }   
})
app.post("/voted", async (req,res)=>{

      const name  = req.body.name;
      // console.log(name);
      var array = name.split(',');
      var bnum = array[0];
      // console.log(bnum);
      var cname = array[1]
      // console.log(cname); 
      var tbName = "vote_batch_"+bnum;
      const result = await db.query("SELECT vote from "+tbName+" WHERE name = $1",[cname]); 
      var vote = result.rows[0].vote;
      // console.log(vote);
      try {
        db.query("UPDATE "+tbName+" SET vote = $1 WHERE name =  $2",[vote+1,cname])
      } catch (error) {
        console.log(error)
      }
      
});
app.post("/votedcamp", async (req,res)=>{

  const name  = req.body.name;
  
  const result = await db.query("SELECT vote from campus_lead WHERE name = $1",[name]); 
  var vote = result.rows[0].vote;
  // console.log(vote);
  try {
    db.query("UPDATE campus_lead SET vote = $1 WHERE name =  $2",[vote+1,name])
  } catch (error) {
    console.log(error)
  }
  
});
app.listen(port, ()=>{
  console.log(`Server is running in port : ${port}`);
});