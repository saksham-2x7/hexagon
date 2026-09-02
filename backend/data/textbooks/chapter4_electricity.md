# Chapter 4: Electricity, Circuits, and Ohm's Law

## Section 4.1: Electric Charge and Electric Current

Electric charge is a fundamental physical property of matter that causes it to experience a force when placed in an electromagnetic field. Electric charge exists in two types: positive charge (carried by protons) and negative charge (carried by electrons). The SI unit of electric charge is the Coulomb (C). One Coulomb is equivalent to the charge of approximately 6.242 x 10^18 electrons.

Electric current (symbolized as $I$) is defined as the rate of flow of electric charge across a cross-sectional area of a conductor over time:
$$I = \frac{Q}{t}$$
where $I$ is the electric current in Amperes (A), $Q$ is the net electric charge in Coulombs (C), and $t$ is the time duration in seconds (s). One Ampere represents one Coulomb of charge moving past a given point per second ($1\text{ A} = 1\text{ C/s}$).

By historical convention, conventional current is defined as the direction in which positive charges would move—flowing from the positive terminal of a voltage source to the negative terminal. However, in metallic wires and conductors, the actual mobile charge carriers are negatively charged electrons, which drift in the opposite direction, from negative potential to positive potential.

## Section 4.2: Electric Potential Difference (Voltage)

For electric charges to flow continuously through a conducting medium, an electric field or potential difference must be maintained across the circuit. Electric potential difference, commonly termed voltage (symbolized as $V$), is defined as the amount of work done or energy transferred per unit electric charge to move the charge between two specific points in an electric field:
$$V = \frac{W}{Q}$$
where $V$ is the electric potential difference in Volts (V), $W$ is the work done or energy in Joules (J), and $Q$ is the electric charge in Coulombs (C). One Volt equals one Joule of energy transferred per Coulomb of charge ($1\text{ V} = 1\text{ J/C}$).

A battery or power supply acts as a source of electromotive force (EMF), converting chemical or mechanical energy into electrical potential energy. The positive terminal possesses a higher electric potential than the negative terminal, establishing the necessary potential gradient that drives current through external components.

## Section 4.3: Ohm's Law and the Water-Pipe Analogy

In 1827, German physicist Georg Simon Ohm experimentally determined that for a metallic conductor maintained at a constant temperature, the electric current flowing through the conductor is directly proportional to the electric potential difference applied across its terminals. This fundamental relationship is known as Ohm's Law:
$$V = I \cdot R$$
From this relationship, the current and resistance can be rearranged as:
$$I = \frac{V}{R} \quad \text{and} \quad R = \frac{V}{I}$$
where:
- $V$ is the voltage (potential difference) across the component, measured in Volts (V).
- $I$ is the current flowing through the component, measured in Amperes (A).
- $R$ is the electrical resistance of the component, measured in Ohms ($\Omega$).

### The Water-Pipe (Hydraulic) Analogy
To intuitively grasp how Voltage, Current, and Resistance interact in an electrical circuit, physicists and teachers often use the classic water-pipe hydraulic analogy:
1. **Voltage ($V$) is like Water Pressure**: Voltage is analogous to the water pressure created by a pump or water tank placed at a high elevation. A higher pressure pushes water through the pipe with greater force, just as a higher voltage pushes electrical charges through a wire.
2. **Current ($I$) is like Water Flow Rate**: Current corresponds to the volumetric flow rate of water (e.g., liters per minute) passing through a section of pipe. Higher flow corresponds to more water molecules per second, just as higher current means more Coulombs of charge per second.
3. **Resistance ($R$) is like Pipe Constriction or Narrowing**: Resistance represents physical constriction, friction, or narrow sections within the pipe that restrict water flow. If a pipe is very narrow or clogged, water flow decreases for a given pressure. Similarly, a high electrical resistance restricts the flow of electric charges for a given voltage.

## Section 4.4: Electrical Resistance and Factors Affecting Resistance

Electrical resistance ($R$) is a measure of the opposition that a material offers to the flow of electric current. When electrons drift through a conductor, they collide with atomic lattice ions, losing kinetic energy which is converted into thermal heat. The SI unit of electrical resistance is the Ohm ($\Omega$). A conductor has a resistance of 1 Ohm if a potential difference of 1 Volt across it produces a current of 1 Ampere.

The resistance of a uniform conductor depends on four primary physical factors:
1. **Length of the Conductor ($L$)**: Resistance is directly proportional to conductor length ($R \propto L$). Doubling the wire length doubles the number of atomic collisions, thereby doubling resistance.
2. **Cross-Sectional Area ($A$)**: Resistance is inversely proportional to cross-sectional area ($R \propto \frac{1}{A}$). A thicker wire provides a wider path with more parallel channels for electron flow, reducing total resistance.
3. **Material Resistivity ($\rho$)**: The intrinsic material property that quantifies how strongly a substance opposes current. Good conductors like copper and silver have very low resistivity ($\rho \approx 10^{-8}\ \Omega\cdot\text{m}$), whereas insulators like rubber and glass have extremely high resistivity ($\rho \approx 10^{12}\ \Omega\cdot\text{m}$).
4. **Temperature ($T$)**: For metallic conductors, higher temperatures increase atomic lattice vibrations, causing more frequent electron collisions and increasing resistance.

The total resistance of a uniform wire is mathematically expressed by the formula:
$$R = \rho \cdot \frac{L}{A}$$

## Section 4.5: Series and Parallel Circuit Configurations

Electrical components in a circuit can be arranged in two fundamental topologies: series and parallel connections.

### Series Circuits
In a series circuit, components are connected end-to-end along a single continuous path:
- **Current is Identical**: The same current passes through every component ($I_{\text{total}} = I_1 = I_2 = \dots = I_n$).
- **Voltage Divides**: Total voltage equals the sum of individual voltage drops across each resistor ($V_{\text{total}} = V_1 + V_2 + \dots + V_n$).
- **Equivalent Resistance**:
  $$R_{\text{eq}} = R_1 + R_2 + R_3 + \dots + R_n$$
Adding resistors in series always increases the total equivalent resistance of the circuit.

### Parallel Circuits
In a parallel circuit, components are connected across the same two common junction points, providing multiple independent branches for current flow:
- **Voltage is Identical**: Every branch experiences the exact same potential difference ($V_{\text{total}} = V_1 = V_2 = \dots = V_n$).
- **Current Divides**: Total current from the power supply equals the sum of branch currents ($I_{\text{total}} = I_1 + I_2 + \dots + I_n$).
- **Equivalent Resistance**:
  $$\frac{1}{R_{\text{eq}}} = \frac{1}{R_1} + \frac{1}{R_2} + \dots + \frac{1}{R_n}$$
For two parallel resistors:
$$R_{\text{eq}} = \frac{R_1 \cdot R_2}{R_1 + R_2}$$
Adding resistors in parallel always decreases the total equivalent resistance because it provides additional alternative pathways for charge to flow.

## Section 4.6: Electrical Power and Energy Dissipation

Electric power ($P$) is the rate at which electrical energy is transferred, consumed, or dissipated into other energy forms (such as heat or light) within a circuit. The SI unit of power is the Watt (W), where $1\text{ W} = 1\text{ Joule per second}$.

Electric power is calculated by multiplying voltage and current:
$$P = V \cdot I$$
By substituting Ohm's Law ($V = I \cdot R$ and $I = \frac{V}{R}$), electrical power dissipation across a resistor can be expressed in two alternative forms:
$$P = I^2 \cdot R \quad \text{and} \quad P = \frac{V^2}{R}$$
The total electrical energy ($E$) consumed over a duration $t$ is:
$$E = P \cdot t = V \cdot I \cdot t = I^2 \cdot R \cdot t$$
This energy dissipation in resistive elements is known as Joule heating.