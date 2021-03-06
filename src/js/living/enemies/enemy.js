"use strict"

// an array in wich all the enemies will  be pushed.
var enemies = [];

/**
* the enemy class derived from the 'Living' class
* @class
* @extends Living
* @param {string} name name of enemy
* @param {number} hp amount of healing points of the enemy
* @param {number} mp amount of mana points of the enemy
* @param {number} strength the strength of the enemy
* @param {number} speed the speed of the enemy
* @param {number} intelligence the intelligence of the enemy
* @param {number} level the level of the enemy
* @param {number} experiencePoints the amount of experience you get when you defeat the enemy
* @param {Item[]} items the items the enemy has
* @param {Weapon[]} weapons the weapons the enemy has.
*/
class Enemy extends Living {

  constructor(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons, model) {
    super(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons, model);

    // let enemyHealth = document.getElementById("enemyHealth1");
    // enemyHealth.max = this.hp;

    this.id = name + enemies.length.toString();
    this.baseAttackSpeed = 2;
    this.time = 0;
    this.type = OBJECT_TYPE.ENEMY;
    this.movementSpeed = 20;
    this.direction = new THREE.Vector3(0, 0, 0);

    // needed for very basic collision
    this.radius = 0;

    // AI
    this.destination = null;
    this.path = []

    // temporary
    this.attackClock = new THREE.Clock();

    this.moving = false;
    // enemies.push(this);
  }

  /**
  * enemy attacks player <br>
  * damage reduction is calculated with the formula: <br>
  * y = -30 + 2 * \sqrt{x*25 +220 } <br>
  * where y is this.totalAttack and x is target.totalDefense <br>
  * @param {Living} target
  */
  attack(target) {
    super.attack(target);
    //this.equipment[EQUIPMENT_TYPE.WEAPON].attackSkill.activate(this, target);

    /* 
     * Please only use the weapon skill to attack.
     * Otherwise the attack animation will not play.
     */

    // console.log(window.player)

    // var time = this.attackClock.getElapsedTime();
    // var playerHealth = document.getElementById("playerHealthBar");

    // if ((2 / this.equipment[EQUIPMENT_TYPE.WEAPON].attackSpeed) > time)
    // return;

    // // reset attack clock
    // this.attackClock.start();

    // target.hp = target.hp - Math.abs(this.totalAttack - (-30 + 2 * Math.sqrt(target.totalDefense * 25 + 220)));
    // // this.equipment[EQUIPMENT_TYPE.WEAPON].attackSkill.activate(this, this.target);
    // //playerHealth.value = Math.floor(target.hp);
    // console.log('playerHP: ' + target.hp);
  }

  /**
  * kills the enemy
  */
  die() {
    super.die();
    this.model.animationStopAllButThis(ANIMATION_TYPE.DIE);
    this.model.animationSwitch(ANIMATION_TYPE.DIE);

    // if enemy is killled add experience points to player
    window.player.experiencePoints += this.experiencePoints;

    // Remove enemies from the enemy array and move them to deadEnemies
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].id == this.id) {
            enemies.splice(i, 1);
            deadEnemies.push(this);
            break;
        }
    }

    // Clean the skeletons from the closet
    if (deadEnemies.length > 10) {
      window.scene.remove(deadEnemies[0].model.mesh);
      deadEnemies.shift();
    }

    this.dropItems();
    this.replaceWithCorpse();

    // Wave switching
    console.log(enemies.length);
    window.player.score += 25;
    console.log('WAVE: ' + window.waveNumber)
    if (enemies.length.toString() == "0") {
      waveDisplay();
      window.player.score += 10 * window.waveNumber;
    }

  }
  /**
  * update loop of enemy
  * @param {number} dt delta time
  */
  update(dt) {
    super.update(dt);

    if (!this.dead) {

      this.equipment[EQUIPMENT_TYPE.WEAPON].attackSkill.update(dt);
      this.attack(window.player);

      if (this.moving) {
        this.model.animationStopAllButThis(ANIMATION_TYPE.WALK);
        this.model.animationSwitch(ANIMATION_TYPE.WALK);
      } else {
        this.model.animationStop(ANIMATION_TYPE.WALK);
        this.model.animationSwitch(ANIMATION_TYPE.IDLE);
      }

      if (this.hp <= 0) {
        this.die();
        this.dead = true;
      }

      if (this.hp > this.hpMax) {
        this.hp = this.hpMax;
      }

      if (this.path.length == 0) {

        // this.destination = new THREE.Vector3(12, 0, 20);
        // this.findPathRec(new Node(this.model.mesh.position, null));
        // this.findShortestPath(this.model.mesh.position, new THREE.Vector3(0, 0, 0));
      }

      // console.log('dist: ' + calcDistanceXZ(window.player.model.mesh.position, this.model.mesh.position))
      if (window.player.model.mesh && this.model.mesh) {
        // this.fixClipping();
        if (calcDistanceXZ(window.player.model.mesh.position, this.model.mesh.position) < 5) {
          // var direction = new THREE.Vector3().addVectors(window.player.model.mesh.position, this.model.mesh.position.multiplyScalar(-1));
          // var ray = THREE.Raycaster(this.model.mesh.position, direction, this.radius, 10);
          // var intersects = ray.intersectObjects(window.scene.children);
          // if (intersects.length != 0) {
          // console.log('wham')
          this.destination = window.player.model.mesh.position;
        } else {
          this.destination = null;
        }
      }


      if (this.destination != null) {
        this.moving = true;
      } else {
        this.moving = false;
      }

      this.move(dt);

      // console.log('dist: ' + calcDistanceXZ(window.player.model.mesh.position, this.model.mesh.position) + ' < ' + this.equipment[EQUIPMENT_TYPE.WEAPON].attackRange)
      // if (window.player.model.mesh && this.model.mesh) {
      //   if (calcDistanceXZ(this.model.mesh.position, window.player.model.mesh.position) < this.equipment[EQUIPMENT_TYPE.WEAPON].attackRange) {
      //     this.attack(window.player);
      //   }

      //   // this.fixClipping();
      // }

    }


  }
  /**
  * replaces the enemy with a corpse
  */
  replaceWithCorpse() {
    console.log('this is a corpse');
    this.model.animationSwitch(ANIMATION_TYPE.DIE);
  }

  /**
  * anti clipping code, <br>
  * non functional atm
  */
  fixClipping() {
    for (let enemy of enemies) {
      if (enemy.id === this.id) {
        continue;
      }

      if (!enemy.model.mesh) {
        break;
      }

      let distanceEnemies = calcDistanceXZ(this.model.mesh.position, enemy.model.mesh.position);

      let count = 0;

      while (distanceEnemies <= (this.radius + enemy.radius) && count <= 100) {
        distanceEnemies = calcDistanceXZ(this.model.mesh.position, enemy.model.mesh.position);

        if (this.direction == new THREE.Vector3(0, 0, 0)) {
          this.direction = new THREE.Vector3(0, 0, 0);
        }

        this.model.mesh.position.x += this.direction.x * -delta;
        this.model.mesh.position.z += this.direction.z * -delta;
      }
    }
  }


  /**
  * drop the items of the enemy
  */
  dropItems() {

    for (let item of this.items) {
      let x = this.model.mesh.position.x + Math.floor(Math.random() * 5) / 10;
      let y = 0.5;
      let z = this.model.mesh.position.z + Math.floor(Math.random() * 5) / 10;
      item.mesh.position.set(x, y, z);

      item.id = item.name + itemsInGame.length;
      item.mesh.name = item.name + itemsInGame.length;
      itemsInGame.push(item);
      window.scene.add(item.mesh);

      // console.log(item);
    }

    // for (var item of itemsInGame)
    // console.log(item);

    // console.log(window.scene);
    // console.log(itemsInGame);
  }

  move(dt) {
    if (this.destination == null) {
      this.moving = false;
      return;
    }

    if (calcDistanceXZ(this.model.mesh.position, this.destination) <= 1) {
      if (this.path.length == 0) {
        this.moving = false;
        return;
      }

      this.destination = this.path.shift();
    }

    // if (this.destination == window.player.model.mesh.position)
    this.model.mesh.lookAt(this.destination);

    dt = dt * this.movementSpeed;
    this.direction.set(this.destination.x - this.model.mesh.position.x, 0, this.destination.z - this.model.mesh.position.z).normalize();
    this.model.mesh.position.set(this.model.mesh.position.x + this.direction.x * dt, this.model.mesh.position.y, this.model.mesh.position.z + this.direction.z * dt);
  }
}
