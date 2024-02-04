import * as THREE from 'three';
import { Injectable } from '@nestjs/common';

// Types
import type {
  ISelf,
  IUnitColliders,
  IUnitCollider,
  TResult,
} from '../../../../models/modules';
import type { IUnit, IUnitInfo, IExplosion, IUpdateMessage } from '../../../../models/api';

// Constants
import { EmitterEvents } from '../../../../models/modules';

// Utils
import Capsule from '../../../../services/math/capsule';
import Helper from '../../../utils/helper';
import Octree from '../../../math/octree';

@Injectable()
export default class Zombies {
  public list: IUnit[];
  public listInfo: IUnitInfo[];
  public colliders: IUnitColliders;
  public counter = 0;

  private _collider: IUnitCollider;
  private _item!: IUnit;
  private _START = {
    id: '',
    name: 'Zombie',
    health: 100,
    animation: 'jump',
    isFire: false,
    isOnHit: false,
    isDead: false,
    positionX: 0,
    positionY: 10,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
    isSleep: true,
  };
  private _id: string;
  private _listInfo2!: IUnitInfo[];
  private _mesh: THREE.Mesh;
  private _v: THREE.Vector3;
  private _group: THREE.Group | null;
  private _octree: Octree;
  private _isOnFloor = false;
  private _result!: TResult;
  private _result2!: TResult;
  private _speed = Number(process.env.NPC_SPEED);
  private _direction: THREE.Vector3;
  private _updates!: IUpdateMessage[];
  private _listAnimate!: IUnit[];
  private _listSleepAnimate!: IUnit[];
  private _listSleepAnimateResult!: IUnit[];
  private _number!: number;
  private _number2!: number;

  private _v1!: THREE.Vector3;
  private _v2!: THREE.Vector3;

  constructor() {
    this.list = [];
    this.listInfo = [];
    this.colliders = {};
    this._v = new THREE.Vector3();
    this._direction = new THREE.Vector3();
  }

  // Добавить юнит
  public addUnit(self: ISelf) {
    ++this.counter;
    this._id = `NPC1/${this.counter}`;
    this._item = {
      ...this._START,
      id: this._id,
    };
    this._item.positionX += Helper.randomInteger(-100, 100);
    this._item.positionZ += Helper.randomInteger(-100, 100);
    this._item.positionX -= 1.5;

    this.list.push(this._item);

    // Добавляем коробку
    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.75),
      new THREE.MeshBasicMaterial(),
    );
    this._mesh.position.set(this._v.x, this._v.y - 0.6, this._v.z);
    this.listInfo.push({
      id: this._id,
      mesh: this._mesh.uuid,
      animation: this._item.animation,
    });
    self.scene[this._id] = this._mesh;

    // Колайдер
    this.colliders[this._id] = {
      collider: new Capsule(
        new THREE.Vector3(
          this._item.positionX,
          this._item.positionY,
          this._item.positionZ,
        ),
        new THREE.Vector3(
          this._item.positionX,
          this._item.positionY - 2,
          this._item.positionZ,
        ),
        1,
      ),
      velocity: new THREE.Vector3(),
      isNotJump: false,
      isForward: false,
      isRun: false,
      isJump: false,
      isJump2: false,
      timer: 0,
      timerNo: 0,
      isBend: false,
      bend: 0,
      octree: new Octree(),
    };

    // addNPC event emit
    self.emiiter.emit(EmitterEvents.addNPC, this._item);
  }

  // Устаноаить позицию юниту
  public setUnit(self: ISelf, unit: IUnit): void {
    // console.log(unit.id, unit.positionX, unit.positionZ); 

    this._item = this.list.find((npc) => npc.id === unit.id);
    if (this._item) {
      this._item.positionX = unit.positionX;
      this._item.positionY = unit.positionY;
      this._item.positionZ = unit.positionZ;
      this._collider = this.colliders[unit.id];
      if (this._collider) {
        this._collider.collider.end.x = unit.positionX;
        this._collider.collider.end.y = unit.positionY - 1.5;
        this._collider.collider.end.z = unit.positionZ;

        if (self.scene[unit.id]) {
          self.scene[unit.id].position.set(
            unit.positionX,
            unit.positionY - 0.6,
            unit.positionZ,
          );
        }
      }
    }
  }

  // Засыпают или просыпаются
  public toggleSleep(ids: string[], is: boolean): void {
    // console.log('Zombies sleep!: ', message);
    this.list.filter((npc) => ids.includes(npc.id)).forEach((npc) => npc.isSleep = is);
  }

  // Столкновения
  private _collitions(
    self: ISelf,
    collider: IUnitCollider,
    locationId: string,
    id: string,
  ): void {
    if (self.octrees[locationId]) {
      this._isOnFloor = false;
      this._result = self.octrees[locationId].capsuleIntersect(
        collider.collider,
      );
      if (this._result) {
        this._isOnFloor = this._result.normal.y > 0;

        if (!this._isOnFloor) {
          collider.velocity.addScaledVector(
            this._result.normal,
            -this._result.normal.dot(collider.velocity),
          );
        }

        collider.collider.translate(
          this._result.normal.multiplyScalar(this._result.depth),
        );
      }
      this.colliders[id].isNotJump = this._isOnFloor;
    }

    if (collider.octree) {
      this._result2 = collider.octree.capsuleIntersect(collider.collider);
      if (this._result2) {
        collider.collider.translate(
          this._result2.normal.multiplyScalar(this._result2.depth),
        );
      }
    }
  }

  public animate(self: ISelf): void {
    // Главная оптимизирующая механика
    this._listAnimate = [...this.list.filter((npc) => !npc.isSleep)];
    this._listSleepAnimate = [...this.list.filter((npc) => npc.isSleep)];
    this._number = Helper.randomInteger(0, this._listSleepAnimate.length - 1);
    this._number2 = this._listAnimate.length < Number(process.env.SLEEP_ANIMATE) ?
      Number(process.env.SLEEP_ANIMATE) - this._listAnimate.length :
      Number(process.env.SLEEP_ANIMATE_MIN);

    if (this._number + this._number2 < this._listSleepAnimate.length) {
      this._listSleepAnimateResult = this._listSleepAnimate
        .slice(this._number, this._number + this._number2);
    } else {
      this._listSleepAnimateResult = this._listSleepAnimate
        .slice(this._number, this._listSleepAnimate.length - 1)
        .concat(this._listSleepAnimate
          .slice(0, this._number + this._number2 - this._listSleepAnimate.length + 1)
        );
    }

    this._listAnimate.concat(this._listSleepAnimateResult)
      .filter((unit) => !unit.isDead)
      .forEach((unit: IUnit) => {
        this._collider = this.colliders[unit.id];
        if (this._collider) {
          // Строим октодеревья для всех кто не спокоен или мертв
          if (unit.animation !== 'idle' && !unit.isDead) this._setUnitOctree(self, unit.id);

          if (unit.animation !== 'dead') {
            // Урон
            if (unit.isOnHit) {
              // console.log('Под ударом!!!');
              this._collider.timer += self.events.delta;

              if (this._collider.timer > 1) {
                this._collider.timer = 0;
                this._collider.timerNo += self.events.delta;
                unit.isOnHit = false;
              }
            }

            // Прыжок
            if (this._collider.isJump) {
              // console.log('Прыгаю!!!');
              this._collider.timer += self.events.delta;

              if (this._collider.timer > 1 && !this._collider.isJump2) {
                this._collider.velocity.y += 120;
                this._collider.isJump2 = true;
              }

              if (this._collider.timer > 3) {
                this._collider.timer = 0;
                this._collider.timerNo += self.events.delta;
                this._collider.isJump = false;
                this._collider.isJump2 = false;
              }
            }

            // Поворот
            if (this._collider.isBend) {
              self.scene[unit.id].rotateY(this._collider.bend * self.events.delta);
            }

            // Идти вперед
            if (unit.animation !== 'idle' && this._collider.isForward) {
              // console.log('Продвигаюсь!!!');
              this._speed = this._collider.isRun
                ? Number(process.env.NPC_SPEED) * 2
                : Number(process.env.NPC_SPEED);
              this._moveForward(self, unit.id);
            }

            // На месте
            if (unit.animation === 'idle') {
              this._collider.velocity.x = 0;
              this._collider.velocity.z = 0;
            }
          }

          // Решения
          if (unit.animation !== 'dead' &&
            !this._collider.timer &&
            !this._collider.timerNo
          ) {
            this._number = Helper.randomInteger(1, Number(process.env.MOTIVATION));
            if (this._number === 1 && !this._collider.isForward) {
              // console.log('Хочу идти вперед!!!');
              this._collider.isForward = true;
              this._collider.timerNo += self.events.delta;
            } else if (this._number === 2 && this._collider.isForward) {
              // console.log('Хочу остановиться!!!');
              this._collider.isForward = false;
              this._collider.velocity.x = 0;
              this._collider.velocity.z = 0;
              this._collider.timerNo += self.events.delta;
            } else if (this._number === 3 &&
              !this._collider.isJump &&
              this._collider.isNotJump &&
              this._collider.isForward) {
              // console.log('Хочу прыгнуть!!!');
              this._collider.isJump = true;
            } else if (this._number === 4 && !this._collider.isJump && !this._collider.isBend) {
              // console.log('Хочу повернуть!!!');
              this._collider.isBend = true;
              this._collider.bend = Helper.staticPlusOrMinus();
              this._collider.timerNo += self.events.delta;
            } else if (this._number === 5 && this._collider.isBend) {
              // console.log('Хочу перестать поворачивать!!!');
              this._collider.isBend = false;
              this._collider.timerNo += self.events.delta;
            }
          } else if (this._collider.timerNo) {
            this._collider.timerNo += self.events.delta;
            if (this._collider.timerNo > 2) {
              this._collider.timerNo = 0;
            }
          }

          // Гравитация
          if (unit.animation === 'dead') {
            this._collider.velocity.y -=
              Number(process.env.GRAVITY) * self.events.delta;
            this._collider.velocity.x = 0;
            this._collider.velocity.z = 0;
          } else {
            this._collider.velocity.y -=
              Number(process.env.GRAVITY) * self.events.delta;
          }

          this._collider.collider.translate(
            this._collider.velocity.clone().multiplyScalar(self.events.delta),
          );

          this._collitions(self, this._collider, self.units[unit.id], unit.id);

          if (this._collider.collider.end.y < 0.5) {
            if (unit.animation === 'dead' && !unit.isDead) unit.isDead = true;

            this._collider.collider.end.y = 0.5;
            this._collider.collider.start.y = 2.5;
          }

          // Выставляем анимацию
          if (unit.health <= 0) unit.animation = 'dead';
          else {
            if (unit.health < 100) unit.health += self.events.delta *
              Number(process.env.REGENERATION) *
              Number(process.env.NPC_REGENERATION_COEF);
            if (unit.health > 100) unit.health = 100;

            if (unit.isOnHit) unit.animation = 'hit';
            else if (this._collider.isJump) unit.animation = 'jump';
            else if (this._collider.isRun) unit.animation = 'run';
            else if (this._collider.isForward) unit.animation = 'walking';
            else unit.animation = 'idle';
          }

          // Записываем данные
          this._v = this._collider.collider.end;
          unit.positionX = this._v.x;
          unit.positionY = this._v.y - 1.5;
          unit.positionZ = this._v.z;

          if (self.scene[unit.id]) {
            self.scene[unit.id].position.set(
              this._v.x,
              this._v.y - 0.6,
              this._v.z,
            );

            unit.directionX = self.scene[unit.id].rotation.x;
            unit.directionY = self.scene[unit.id].rotation.y;
            unit.directionZ = self.scene[unit.id].rotation.z;
          }
        }
      });
  }

  private _moveForward(self: ISelf, id: string): void {
    self.scene[id].getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize().multiplyScalar(this._speed * self.events.delta);
    this.colliders[id].velocity.add(this._direction);
  }

  // Пересоздаем динамическое октодерево из самых ближних коробок и "без его коробки"
  private async _setUnitOctree(self: ISelf, id: string): Promise<void> {
    this._group = new THREE.Group();
    if (self.unitsByLocations[self.units[id]])
      this._listInfo2 = self.unitsByLocations[self.units[id]]
        .filter(
          (item) =>
            item.animation !== 'dead' &&
            item.id !== id &&
            self.scene[item.id].position.distanceTo(self.scene[id].position) <
            3,
        )
        .sort(
          (a, b) =>
            self.scene[a.id].position.distanceTo(self.scene[id].position) -
            self.scene[b.id].position.distanceTo(self.scene[id].position),
        )
        .slice(0, 2);
    if (this._listInfo2.length) {
      this._listInfo2.forEach((item: IUnitInfo) => {
        this._group.add(self.scene[item.id]);
      });
    }
    this._octree = new Octree();
    this._octree.fromGraphNode(this._group);
    this.colliders[id].octree = this._octree;
    this._group.remove();
    this._group = null;
  }

  public onExplosion(message: IExplosion): IUpdateMessage[] {
    // console.log('Zombies onExplosion!!!!!!!!!!!!!: ', message);
    this._updates = [];
    this.list.filter((unit) => new THREE.Vector3(
      message.positionX,
      message.positionY,
      message.positionZ,
    ).distanceTo(new THREE.Vector3(
      unit.positionX,
      unit.positionY,
      unit.positionZ,
    )) < Number(process.env.EXPLOSION_DISTANCE))
      .forEach((unit: IUnit) => {
        this._v1 = new THREE.Vector3(
          message.positionX,
          message.positionY,
          message.positionZ,
        );
        this._v2 = new THREE.Vector3(
          unit.positionX,
          unit.positionY,
          unit.positionZ,
        );
        this._number = this._v1.distanceTo(this._v2);
        // console.log('Zombies onExplosion!!!!!!!!!!!!!: ', unit.id, this._number);
        if (this._number < Number(process.env.EXPLOSION_DISTANCE)) {
          // При попадании по коробке - ущерб сильнее
          // Если режим скрытый - в два раза меньше
          unit.health +=
            (-1 / this._number) *
            (unit.id === message.enemy ?
              Number(process.env.DAMAGE) * Number(process.env.NPC_DAMAGE_COEF) * Number(process.env.EXACT_DAMAGE_COEF) :
              Number(process.env.DAMAGE) * Number(process.env.NPC_DAMAGE_COEF));
          this._updates.push({
            id: unit.id,
            health: unit.health,
            is: unit.id === message.enemy,
          });
          // Если растояние от взрыва в два раза меньше того, от которого случается урон - показываем удар на персонаже 
          if (this._number < Number(process.env.EXPLOSION_DISTANCE) / 2) unit.isOnHit = true;
        }
      });
    return this._updates;
  }
}
