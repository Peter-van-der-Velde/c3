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

    constructor(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons) {
        super(name, hp, mp, strength, defense, speed, intelligence, level, experiencePoints, items, weapons);

        let health = document.getElementById("health");
        health.max = this.hp;
        this.id = name + enemies.length.toString();
        this.baseAttackSpeed = 2;
        this.time = 0;
        this.type = OBJECT_TYPE.ENEMY;

        // needed for very basic collision
        this.radius = 0;

        // AI
        this.q = [];
        this.q.push(this.mesh.position);
        this.destination = null;
    }

    /**
     * enemy attacks player <br>
     * damage reduction is calculated with the formula: <br>
     * y = -30 + 2 * \sqrt{x*25 +220 } <br>
     * where y is this.totalAttack and x is target.totalDefense <br>
     * @param {Living} target
     */
    attack(target) {
        var playerHealth = document.getElementById("playerHealthBar");
        playerHealth.value = target.hp;
        target.hp = target.hp - (this.totalAttack - (-30 + 2 * Math.sqrt(target.totalDefense * 25 + 220)));

    }

    /**
     * kills the enemy
     */
    die() {
        console.log(this.name + ' is dead');
        health.value = 100;
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].id == this.id) {
                enemies.splice(i, 1);
                break;
          }
        }
        this.dropItems();
        this.replaceWithCorpse();
        // setTimeout(function(){ window.location.href = "../src/gameOver.html"; }, 10000);
        // $("html").fadeOut(speed = 10000);
        //fadein 

    }



    /**
     * update loop of enemy
     * @param {number} dt delta time
     */
    update(dt) {
      super.update(dt);



        if (this.hp <= 0){
          this.die();
        }


        if (this.hp > this.hpMax)
            this.hp = this.hpMax;

        this.move();
    }

    /**
     * replaces the enemy with a corpse
     */
    replaceWithCorpse() {
        console.log('this is a corpse');
    }


    /**
     * drop the items of the enemy
     */
    dropItems() {

        for (let item of this.items) {
            let x = this.mesh.position.x + Math.floor(Math.random() * 5) / 10;
            let y = 0.5;
            let z = this.mesh.position.z + Math.floor(Math.random() * 5) / 10;
            item.mesh.position.set(x, y, z);

            item.id = item.name + itemsInGame.length;
            item.mesh.name = item.name + itemsInGame.length;
            itemsInGame.push(item);
            window.scene.add(item.mesh);

            console.log(item);
        }

        for (var item of itemsInGame)
            console.log(item);

        console.log(window.scene);
        console.log(itemsInGame);
    }

    move() {

    }

    findShortestPath(startCoordinates, destination) {
        var q = [];

        // north;
        var ray = new HTMLHRElement.Raycaster(startCoordinates, new HTMLHRElement.Vector3(1, 0, 0));

        this.q.push(startCoordinates);
    }

}
