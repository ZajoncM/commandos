var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Point = require('../models/Point');
var { nanoid } = require("nanoid");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET group page. */
router.get('/setGroup/:group', async (req, res, next) => {
  const {group} = req.params;

  if(!req.cookies.id) {
    const id = nanoid();
    await User.create({id, group: parseInt(group)}).then(() => console.log('inserted'))
    res.cookie('id', id); 
  }

  res.render('newGroup', { title: 'Cześć', message: `jesteś w grupie ${group}` });
});

router.get('/getPoint/:id', async (req, res, next) => {
  const {id} = req.params;
  const session = req.cookies.id;

  try {
    if(!session) {
      throw 'Brak sesji';
    }

    const user = await User.findOne({
      where:{
        id: session
      }
    });

    if(!user) {
      throw 'Nie ma takiego użytkownika';
    }


    const points = await Point.findAll();
    const users = await User.findAll();

    const userGroup = user.group;

    const groupUsers = users.filter(u => u.group === userGroup);
    const groupIds = groupUsers.map(u => u.id)

    
    
    const groupPoints = points.filter(p => groupIds.includes(p.userId))
    const pointIds = groupPoints.map(p => p.number);

    if(pointIds.includes(parseInt(id))) {
      throw 'Twoja grupa zdobyła już ten punkt';
    }

    await Point.create({number: id, userId: user.id})


    res.render('newGroup', { title: `Zdobyłeś punkt ${id}` });
  } catch (error) {
    res.render('error', { message: error});
  }
});

router.get('/showGroups', async (req, res, next) => {
  const users = await User.findAll();

  res.render('groups', { title: 'Użytkownicy', users });
});

module.exports = router;
