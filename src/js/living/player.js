"use strict"

/**
* the player class derived from the 'Living' class
* @class
* @extends Living
* @param {string} name name of the player
* @param {number} hp amount of healing points of the player
* @param {number} mp amount of mana points of the player
* @param {number} strength the strength of the player
* @param {number} speed the speed of the player
* @param {number} intelligence the intelligence of the player
* @param {number} level the level of the player
* @param {number} experiencePoints the amount of experience points the player has
* @param {Item[]} items the items the player has
* @param {Weapon[]} weapons the weapons the player has.
* @param {PlayerClass} playerClass the warrior class this player is
*/
class Player extends Living {

  constructor(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons, playerClass, camera, scene, model) {

    super(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons, model);
    this.hpRegen = 1;
    this.mpRegen = 1;

    this.baseAttackSpeed = 2;
    this.input = new Input();

    this.type = OBJECT_TYPE.PLAYER;
    this.playerClass = playerClass;
    this.calcDerivedStats();

    // Movement stats
    this.scene = scene;
    this.destination = null;
    this.direction = new THREE.Vector3(0, 0, 0);
    this.movementSpeed = 5;

    // the target of the player
    this.target = null;
    console.log(this);

    this.skills[0] = new AoeSkill("foo", "bar", 5, 0, 10, 3, 4, 6, 'img/skills/spinner.png', null);
    this.mesh = null;

    this.score = 0;
  }

  /**
  * levels up player <br>
  * based upon the output of: ((6d4 - 3) / 3) - 2
  */
  levelUp() {
    let dice = new Dice("6d4");

    this.hpMax += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);
    this.mpMax += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);
    this.strength += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);
    this.defense += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);
    this.intelligence += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);
    this.luck += Math.abs(Math.floor((dice.roll() - 3) / 3) - 3);

    this.level += 1;
    this.score += this.level * 20;
  }

  /**
  * Calculates the needed amount of experience points for that level
  * @param {number} level
  */
  nextLevel(level) {
    let exponent = 1.5
    let baseXP = 100
    return Math.floor(baseXP * (level ^ exponent))
  }

  /**
  * Adds item to the inventory of the player
  * @param {Item} item
  */
  addItem(item) {
    if (this.items.length <= 20)
      this.items.push(item);
    else
      console.log("No more space available.")
  }

  /**
  * Player attacks target <br>
  * damage reduction is calculated with the formula: <br>
  * y = -30 + 2 * \sqrt{x*25 +220 } <br>
  * where y is this.totalAttack and x is target.totalDefense <br>
  * @param {Enemy} target
  */
  attack(target) {
    super.attack(target);

    let enemyHealthDisplay = document.getElementById("enemyHealth");
    let enemyHealth = document.getElementById("enemyHealth1");

    enemyHealthDisplay.style.display = "block";

    enemyHealth.value = target.hp;
    if (target.hp <= 0) {
      enemyHealthDisplay.style.display = "none";
    }
  }

  /**
  * update loop of the player
  * @param {number} dt delta time
  */
  update(dt) {
    super.update(dt);

    // console.log(this.nextLevel(this.level) + ' < ' + this.experiencePoints);
    // if (this.nextLevel(this.level) <= this.experiencePoints) {
    //   this.experiencePoints = this.experiencePoints - this.nextLevel(this.level);
    //   this.levelUp();
    //   console.log('LEVEL UP!');
    // }


    // Set hp and mp bars.
    let mana = document.getElementById("playerManaBar");
    let health = document.getElementById("playerHealthBar");

    mana.value = this.mp;
    health.value = this.hp;

    if (this.moving) {
      this.model.animationSwitch(ANIMATION_TYPE.WALK);
    } else {
      this.model.animationStop(ANIMATION_TYPE.WALK);
      this.model.animationSwitch(ANIMATION_TYPE.IDLE);
    }

    if (this.hp <= 0) {
      this.die();
    }

    this.input.update();
    this.move(dt);

    if (this.destination != null) {
      //Checks wether or not you want to pick up an item or attack an enemy, the preference is to attack enemies.
      for (let i = 0; i < itemsInGame.length; i++) {
        if (calcDistanceXZ(itemsInGame[i].mesh.position, this.destination) < 2)
          this.target = itemsInGame[i];
      }

      for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].model.mesh) {
          if (calcDistanceXZ(enemies[i].model.mesh.position, this.destination) < 2) {
            this.target = enemies[i];
          }
        }
      }
    }

    this.skills[0].update(dt);

    if (this.input.one) {
      this.skills[0].activate(this, this);
      var putSkillOnCooldown = document.getElementById("skillSpinner");
      putSkillOnCooldown.style.opacity = 0.5;
      setTimeout(function(){
        putSkillOnCooldown.style.opacity = 1;
      }, 9000);
    }

    if (this.target == null)
      return;

    if (this.target.type == OBJECT_TYPE.ITEM || this.target.type == OBJECT_TYPE.WEAPON) {
      if (calcDistanceXZ(this.model.mesh.position, this.target.mesh.position) > 0.5)
        return;

      this.pickUpItem(this.target);

      return;
    }

    if (this.target.hp <= 0) {
      this.target = null;
      return;
    }



    this.attack(this.target);
    this.equipment[EQUIPMENT_TYPE.WEAPON].attackSkill.update(dt);
  }

  /**
  * Picks up item. <br>
  * Also removes item from the itemsInGame array.
  * @param {Item} item
  */
  pickUpItem(item) {
    if (this.items.length >= 60) {
      console.log("No more space available.")
      return;
    }

    window.scene.remove(item.mesh);
    this.items.push(item);

    // if (this.target == null)
    // return;

    // removes item from itemsInGame arrray
    for (let i = 0; i < itemsInGame.length; i++) {
      if (itemsInGame[i].id == item.id) {
        console.log('found: ' + item.id);
        itemsInGame.splice(i, 1);
        break;
      }
    }
    updateInventory(item);
    broadcastPickUp(item.name);
    player.defense = parseInt(player.defense) + parseInt(item.defense);
    console.log("PETEEEEEEER LIMONAAADEEE!");



    console.log(this.items);
    console.log(itemsInGame);

    this.target = null;
  }

  /**
  * when player dies use this function
  */
  die() {
    var name = this.name;
    var score = this.score;

    setTimeout(function () { window.location.replace("create.php?name=" + name + "&score=" + score + ""); }, 12000);
    $("html").fadeOut(speed = 10000);
    window.playerIsDead = true;
    // reset to last shrine/bonfire/savespot
  }

  /**
  * moves the playes
  * @param {number} dt delta time
  */
  move(dt) {
    if (this.input.click && this.model) {
      this.destination = this.getRayPos(this.scene);
      this.model.mesh.lookAt(new THREE.Vector3(this.destination.x, this.model.mesh.position.y, this.destination.z));
      this.moving = true;
    }

    if (this.destination == null)
      return;

    if (calcDistanceXZ(this.destination, this.model.mesh.position) < 0.1) {
      console.log('umm 0.1')
      this.destination = null;
      this.moving = false;
      return;
    }

    if (this.destination == null)
      return;

    dt = dt * this.movementSpeed;
    this.direction.set(this.destination.x - this.model.mesh.position.x, 0, this.destination.z - this.model.mesh.position.z).normalize();
    this.model.mesh.position.set(this.model.mesh.position.x + this.direction.x * dt, this.model.mesh.position.y, this.model.mesh.position.z + this.direction.z * dt);

    return;
  }


  /**
  * get's the position of the 2d click in the 3d world
  * @param {THREE.Scene} scene
  */
  getRayPos(scene) {
    var mouse = new THREE.Vector2();
    mouse.x = (this.input.mouseLocation.x / window.innerWidth) * 2 - 1;
    mouse.y = -(this.input.mouseLocation.y / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera);
    raycaster.set(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      return intersects[0].point;
    }
    return null;
  }
}
