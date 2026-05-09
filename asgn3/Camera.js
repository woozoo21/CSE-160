class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([4, 1, 4]);
    this.at  = new Vector3([4, 1, 0]);
    this.up  = new Vector3([0, 1, 0]);
    this.viewMatrix       = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.updateMatrices();
  }

  updateMatrices() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
  }

  moveForward(speed = 0.2) {
    let f = new Vector3(); f.set(this.at); f.sub(this.eye); f.normalize(); f.mul(speed);
    this.eye.add(f); this.at.add(f);
    this.updateMatrices();
  }

  moveBackwards(speed = 0.2) {
    let b = new Vector3(); b.set(this.eye); b.sub(this.at); b.normalize(); b.mul(speed);
    this.eye.add(b); this.at.add(b);
    this.updateMatrices();
  }

  moveLeft(speed = 0.2) {
    let f = new Vector3(); f.set(this.at); f.sub(this.eye); f.normalize();
    let s = Vector3.cross(this.up, f); s.normalize(); s.mul(speed);
    this.eye.add(s); this.at.add(s);
    this.updateMatrices();
  }

  moveRight(speed = 0.2) {
    let f = new Vector3(); f.set(this.at); f.sub(this.eye); f.normalize();
    let s = Vector3.cross(f, this.up); s.normalize(); s.mul(speed);
    this.eye.add(s); this.at.add(s);
    this.updateMatrices();
  }

  panLeft(alpha = 3) {
    let f = new Vector3(); f.set(this.at); f.sub(this.eye);
    let rot = new Matrix4();
    rot.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f2 = rot.multiplyVector3(f);
    this.at.set(this.eye); this.at.add(f2);
    this.updateMatrices();
  }

  panRight(alpha = 3) { this.panLeft(-alpha); }
}