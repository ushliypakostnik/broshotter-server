import * as THREE from 'three';
import { Injectable } from '@nestjs/common';

// Types
import type {
  ISelf,
  IUnitColliders,
  IUnitCollider,
  TResult,
} from '../../../../models/modules';
import type { IUnit, IUnitInfo } from '../../../../models/api';

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

  private _collider: IUnitCollider;
  private _item!: IUnit;
  private _counter = 0;
  private _time = 0;
  private _START = {
    id: '',
    name: 'Zombie',
    health: 100,
    animation: 'jump',
    isFire: false,
    isOnHit: false,
    positionX: 0,
    positionY: 10,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
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
  private _number = 0;

  constructor() {
    this.list = [];
    this.listInfo = [];
    this.colliders = {};
    this._v = new THREE.Vector3();
    this._direction = new THREE.Vector3();
  }

  private _addUnit(self: ISelf) {
    ++this._counter;
    this._id = `NPC1/${this._counter}`;
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
      timerJump: 0,
      bend: 0,
      octree: new Octree(),
    };

    // addNPC event emit
    self.emiiter.emit(EmitterEvents.addNPC, this._item);
  }

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
    // console.log('Zombies animate', units);

    // Решение на создание нового зомби
    this._time += self.events.delta;
    if (this._time > 0.01) {
      if (this._counter < Number(process.env.MAX_ZOMBIE || 5))
        this._addUnit(self);
      this._time = 0;
    }

    if (this.list.length) {
      this.list.forEach((unit: IUnit) => {
        this._collider = this.colliders[unit.id];
        if (this._collider) {
          if (unit.animation !== 'idle' && unit.animation !== 'dead')
            this._setUnitOctree(self, unit.id);

          if (this._collider.isNotJump) {
            if (unit.animation !== 'dead') {
              this._number = Helper.randomInteger(1, 500);

              // Решения
              if (this._number === 1 && !this._collider.isForward) {
                this._collider.isForward = true;
              } else if (this._number === 2 && this._collider.isForward) {
                this._collider.isForward = false;
              } else if (
                this._number === 3 &&
                !this._collider.isJump &&
                this._collider.isForward
              ) {
                this._collider.isJump = true;
              } else if (this._number === 4 && !this._collider.isJump) {
                this._collider.bend = Helper.randomInteger(-1, 1);
              }

              if (this._collider.bend !== 0 && !this._collider.isJump)
                self.scene[unit.id].rotateY(
                  this._collider.bend * self.events.delta,
                );

              if (this._collider.isForward) {
                this._speed = this._collider.isRun
                  ? Number(process.env.NPC_SPEED) * 2
                  : Number(process.env.NPC_SPEED);
                this._moveForward(self, unit.id);
              }

              if (this._collider.isJump) {
                this._collider.timerJump += self.events.delta;

                if (this._collider.timerJump > 1 && !this._collider.isJump2) {
                  this._collider.velocity.y += 100;
                  this._collider.isJump2 = true;
                }

                if (this._collider.timerJump > 3) {
                  this._collider.timerJump = 0;
                  this._collider.isJump = false;
                  this._collider.isJump2 = false;
                }
              }
            }

            this._collider.velocity.addScaledVector(
              this._collider.velocity,
              Helper.damping(self.events.delta),
            );
          } else {
            this._collider.velocity.y -=
              Number(process.env.GRAVITY) * self.events.delta;
          }

          this._collider.collider.translate(
            this._collider.velocity.clone().multiplyScalar(self.events.delta),
          );

          this._collitions(self, this._collider, self.units[unit.id], unit.id);

          if (this._collider.collider.end.y < 0.5) {
            this._collider.collider.end.y = 0.5;
            this._collider.collider.start.y = 2.5;
          }

          if (unit.health <= 0) unit.animation = 'dead';
          else {
            if (unit.isOnHit) unit.animation = 'hit';
            else if (this._collider.isJump) unit.animation = 'jump';
            else if (this._collider.isRun) unit.animation = 'run';
            else if (this._collider.isForward) unit.animation = 'walking';
            else unit.animation = 'idle';
          }

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
  }

  private _moveForward(self: ISelf, id: string): void {
    self.scene[id].getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize().multiplyScalar(this._speed * self.events.delta);
    this.colliders[id].velocity.add(this._direction);
  }

  private async _setUnitOctree(self: ISelf, id: string): Promise<void> {
    // Пересоздаем динамическое октодерево из самых ближних коробок и "без его коробки"
    this._group = new THREE.Group();
    if (self.unitsByLocations[self.units[id]])
      this._listInfo2 = self.unitsByLocations[self.units[id]]
        .filter(
          (item) =>
            item.animation !== 'dead' &&
            item.id !== id &&
            self.scene[item.id].position.distanceTo(self.scene[id].position) <
              2,
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
}
