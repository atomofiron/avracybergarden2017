AFRAME.registerComponent('aabb-collider', {
    schema: {
        objects: {
            default: ''
        },
        state: {
            default: 'collided'
        }
    },
    init: function() {
        this.els = [];
        this.collisions = [];
        this.elMax = new THREE.Vector3();
        this.elMin = new THREE.Vector3();
    },
    update: function() {
        var data = this.data;
        var objectEls;
        if (data.objects) {
            objectEls = this.el.sceneEl.querySelectorAll(data.objects);
        } else {
            objectEls = this.el.sceneEl.children;
        }
        this.els = Array.prototype.slice.call(objectEls);
    },
    tick: (function() {
        var boundingBox = new THREE.Box3();
        return function() {
            var collisions = [];
            var el = this.el;
            var mesh = el.getObject3D('mesh');
            var self = this;
            if (!mesh) {
                return;
            }
            updateBoundingBox();
            this.els.forEach(intersect);
            collisions.forEach(handleHit);
            if (collisions.length === 0) {
                self.el.emit('hit', {
                    el: null
                });
            }
            this.collisions.filter(function(el) {
                return collisions.indexOf(el) === -1;
            }).forEach(function removeState(el) {
                el.removeState(self.data.state);
            });
            this.collisions = collisions;

            function intersect(el) {
                var intersected;
                var mesh = el.getObject3D('mesh');
                var elMin;
                var elMax;
                if (!mesh) {
                    return;
                }
                boundingBox.setFromObject(mesh);
                elMin = boundingBox.min;
                elMax = boundingBox.max;
                intersected = (self.elMin.x <= elMax.x && self.elMax.x >= elMin.x) && (self.elMin.y <= elMax.y && self.elMax.y >= elMin.y) && (self.elMin.z <= elMax.z && self.elMax.z >= elMin.z);
                if (!intersected) {
                    return;
                }
                collisions.push(el);
            }

            function handleHit(hitEl) {
                hitEl.emit('hit');
                hitEl.addState(self.data.state);
                self.el.emit('hit', {
                    el: hitEl
                });
            }

            function updateBoundingBox() {
                boundingBox.setFromObject(mesh);
                self.elMin.copy(boundingBox.min);
                self.elMax.copy(boundingBox.max);
            }
        };
    })()
});
