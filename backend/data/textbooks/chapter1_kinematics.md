# Chapter 1: Kinematics and the Laws of Motion

## Section 1.1: Position, Displacement, and Distance

Kinematics is the branch of classical mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause the motion.

To describe the motion of an object, one must specify its position relative to a convenient reference frame or coordinate origin.
- **Distance ($d$)**: A scalar physical quantity representing the total length of the continuous path traveled by an object, regardless of direction. Distance is always a non-negative real number measured in meters (m).
- **Displacement ($\Delta x$ or $\vec{s}$)**: A vector physical quantity defined as the straight-line change in position from an initial coordinate ($x_i$) to a final coordinate ($x_f$):
$$\Delta x = x_f - x_i$$
Displacement has both a numerical magnitude and a spatial direction (e.g., $+15\text{ m}$ along the x-axis or $15\text{ m}$ North). While the distance traveled along a curved path can be large, the displacement between start and finish can be zero if the object returns to its starting location.

## Section 1.2: Speed versus Velocity

The rate of motion is quantified using two distinct physical concepts: speed and velocity.

### Average Speed
Average speed is a scalar quantity defined as the total distance traveled divided by the total elapsed time:
$$\text{Average Speed} = \frac{\text{Total Distance}}{\Delta t}$$

### Average Velocity
Average velocity ($\vec{v}$) is a vector quantity defined as the displacement divided by the elapsed time:
$$\vec{v}_{\text{avg}} = \frac{\Delta \vec{x}}{\Delta t} = \frac{x_f - x_i}{t_f - t_i}$$
The SI unit for both speed and velocity is meters per second ($\text{m/s}$).

### The Car Speedometer Analogy
To intuitively grasp the difference between instantaneous speed and velocity:
A car's dashboard speedometer measures instantaneous speed—it indicates that the vehicle is moving at $60\text{ km/h}$, but provides no indication of whether the vehicle is heading East, North, or driving in circles. In contrast, an onboard GPS navigation system calculates velocity by determining both the rate of motion and the vector direction towards the destination.

## Section 1.3: Acceleration and the Kinematic Equations

Acceleration ($\vec{a}$) is defined as the rate at which an object changes its velocity over time:
$$\vec{a}_{\text{avg}} = \frac{\Delta \vec{v}}{\Delta t} = \frac{v_f - v_i}{t_f - t_i}$$
The SI unit of acceleration is meters per second squared ($\text{m/s}^2$). Because velocity is a vector, an object accelerates whenever it changes its speed, changes its direction of motion, or both (such as a satellite in uniform circular orbit).

### The Four Kinematic Equations (Uniform Acceleration)
When an object undergoes constant uniform acceleration ($a = \text{constant}$), its motion is governed by four fundamental kinematic equations:
1. **Velocity-Time Relation**:
   $$v_f = v_i + a \cdot t$$
2. **Position-Time Relation**:
   $$x_f = x_i + v_i \cdot t + \frac{1}{2} a \cdot t^2$$
3. **Velocity-Displacement Relation (Torricelli's Equation)**:
   $$v_f^2 = v_i^2 + 2 a \cdot (x_f - x_i)$$
4. **Average Velocity Displacement**:
   $$\Delta x = \left(\frac{v_i + v_f}{2}\right) t$$

## Section 1.4: Newton's Laws of Motion and Inertia

Sir Isaac Newton formulated three foundational laws that connect the kinematics of an object to the dynamical forces acting upon it.

### Newton's First Law (Law of Inertia)
An object at rest remains at rest, and an object in motion continues in uniform motion along a straight line at constant velocity, unless acted upon by a non-zero net external force:
$$\sum \vec{F} = 0 \implies \vec{a} = 0 \quad (\vec{v} = \text{constant})$$
Inertia is the natural tendency of an object to resist changes in its state of motion. The quantitative measure of an object's inertia is its inertial mass ($m$), measured in kilograms (kg).

### Newton's Second Law (Fundamental Law of Dynamics)
The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass:
$$\sum \vec{F} = m \cdot \vec{a}$$
where force is measured in Newtons ($\text{N}$), where $1\text{ N} = 1\text{ kg}\cdot\text{m/s}^2$.

### Newton's Third Law (Action-Reaction Principle)
Whenever one body exerts a force on a second body, the second body simultaneously exerts a force equal in magnitude and opposite in direction on the first body:
$$\vec{F}_{A \to B} = -\vec{F}_{B \to A}$$

## Section 1.5: Free Fall and Gravitational Acceleration

Free fall is the idealized motion of a body where gravity is the sole force acting upon it (neglecting aerodynamic drag). Near the surface of Earth, all free-falling objects accelerate downward at the constant standard acceleration of gravity:
$$g \approx 9.80\text{ m/s}^2 \quad (\text{or } 9.81\text{ m/s}^2)$$
Regardless of whether an object is dropped from rest, thrown upward, or projected sideways, its vertical downward acceleration remains constant at $a_y = -g$.