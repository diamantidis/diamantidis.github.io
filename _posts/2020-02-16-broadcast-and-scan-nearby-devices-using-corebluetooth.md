---
layout: post
title: Scan and broadcast to nearby devices with Core Bluetooth
description: A post about how to implement a Catalyst app to scan and advertise to nearby devices using Swift and Core Bluetooth framework
date: 2020-02-16 06:00 +0200
comments: true
tags: [Swift, "Core Bluetooth", Catalyst, iOS]
---

The topic of this post is about Bluetooth and how we can use it in our applications.

Bluetooth technology can be used in a variety of ways, and in this post I am going to focus on how we can make our device broadcast its presence to nearby devices, and also how we can scan for nearby devices that are running our app. 

In order to implement this app, we are going to use [`Core Bluetooth`](https://developer.apple.com/documentation/corebluetooth), a framework to communicate between BLE devices provided by Apple.

Long story short, in this article, I am going to create a simple app to demonstrate how to use `Core Bluetooth` to implement the above mentioned scenario. The app will consists of a `UITextField`, where the user will enter the name for the device and two instances of `UIButton`. The one button will act as a trigger to start broadcasting, while the other will start the process of scanning other nearby devices.

![Sample app screenshot]({{site.url}}/assets/corebluetooth/sample_app.png)

## Implementation

Before we dig deeper to the implementation, let's take a look on some terminology. A BLE(Bluetooth Low Energy) device can be categorized into two roles: `peripheral` and `central`. A device acting as a peripheral advertises its presence, whereas a device acting as a central listens to these advertising packets. So in our case, we want our application to act both as a peripheral and a central. 

With separation of concerns in mind, we are going to create a class that will handle the logic of broadcasting and scanning for devices using `CoreBluetooth`, and then we will see how we can use this class in a Catalyst application.


Before we jump to the actual implementation, let's take some time to think about the desired behavior of this class and define the corresponding `protocol`.

First of all, we are going to need two functions that will be responsible for the initialization of the advertising and the scanning process. For the advertising one, we need to pass a `String` as a parameter, which is going to be used as the name of our device. Then, we have to somehow notify the uses of this class when a new device is discover. Maybe for this, we can use a delegate with a function that will be called once a new device is found and a hash map to store the peripherals.

```swift
protocol BluetoothManagerDelegate: AnyObject {
    func peripheralsDidUpdate()
}

protocol BluetoothManager {
    var peripherals: Dictionary<UUID, CBPeripheral> { get }
    var delegate: BluetoothManagerDelegate? { get set }
    func startAdvertising(with name: String)
    func startScanning()
}
```  

Now that we have our protocol ready, we can move on to the actual implementation. Let's create a new class named `CoreBluetoothManager`. This class will conform to the `BluetoothManager` protocol and will have the following content:

```swift
class CoreBluetoothManager: NSObject, BluetoothManager {
    // MARK: - Public properties
    weak var delegate: BluetoothManagerDelegate?
    private(set) var peripherals = Dictionary<UUID, CBPeripheral>() {
        didSet {
            delegate?.peripheralsDidUpdate()
        }
    }

    // MARK: - Public methods
    func startAdvertising(with name: String) {
        self.name = name
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func startScanning() {
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    // MARK: - Private properties
    private var peripheralManager: CBPeripheralManager?
    private var centralManager: CBCentralManager?
    private var name: String?
}
```

> Please mind that you have to add `import CoreBluetooth` in the beginning of the file.

First, we describe the public properties for the `delegate` and the `peripherals`. When the value of the `peripherals` is updated, we call the `peripheralsDidUpdate` function to notify the delegate. 

Then, we define the implementation for the `func startAdvertising(with name: String)` requirement. In this function, we initialize an instance of `CBPeripheralManager` which we will store in a private property. `CBPeripheralManager` is part of the  `CoreBluetooth` framework and its primary function is to allow us to advertise to other devices. 

> For now the compiler will complain because we have set `self` as the delegate and it is not conforming to the `CBPeripheralManagerDelegate` protocol. We are going to fix this soon.

Moving on, we have the implementation for the `startScanning` requirement. In this case we initialize an instance of `CBCentralManager` which we also store in a private property. `CBCentralManager` is responsible for scanning for nearby BLE devices.


Since the compiler is complaining about the delegate, let's try to implement them. First, let's add an extension to the `CoreBluetoothManager` that will conform to the `CBPeripheralManagerDelegate` protocol and add the following content: 

```swift
extension CoreBluetoothManager: CBPeripheralManagerDelegate {
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            if peripheral.isAdvertising {
                peripheral.stopAdvertising()
            }

            let uuid = CBUUID(string: Constants.SERVICE_UUID.rawValue)
            var advertisingData: [String : Any] = [
                CBAdvertisementDataServiceUUIDsKey: [uuid]
            ]

            if let name = self.name {
                advertisingData[CBAdvertisementDataLocalNameKey] = name
            }
            self.peripheralManager?.startAdvertising(advertisingData)
        } else {
            #warning("handle other states")
        }
    }
}
```

Here, we provide an implementation for the `peripheralManagerDidUpdateState` requirement. In the body of this function we check if the `peripheral.state` is `.poweredOn` as described on [Apple's documentation](https://developer.apple.com/documentation/corebluetooth/cbperipheralmanager).

> Before you call CBPeripheralManager methods, the peripheral manager object must be in the powered-on state, as indicated by the ```CBPeripheralManagerState.poweredOn```. This state indicates that the device (your iPhone or iPad, for instance) supports Bluetooth low energy and that its Bluetooth is on and available for use.

After that, we check if the peripheral is already advertising and if it does, we stop it so that we can start advertising again with the new `advertisingData` which we are doing exactly after. `advertisingData` is a dictionary that contains the data to advertise. The supported advertising data types are `CBAdvertisementDataServiceUUIDsKey` and `CBAdvertisementDataLocalNameKey`. The first one is a UUID specific to our application and it will be used to filter out other BLE devices, whereas the second one is the local name of the peripheral.

For the service UUID, we add an `enum` named `Constants`, where we add a case for the `SERVICE_UUID`, like in the following snippet

```swift
enum Constants: String {
    case SERVICE_UUID = "4DF91029-B356-463E-9F48-BAB077BF3EF5"
}
```

Finally, we can call the `startAdvertising` function to initiate the advertising process.

Let's move now to the scanning part of our class. We are going to add another extension to `CoreBluetoothManager` and this time it will conform to the `CBCentralManagerDelegate` protocol. The content of this extension will be the following:

```swift
extension CoreBluetoothManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {

            if central.isScanning {
                central.stopScan()
            }

            let uuid = CBUUID(string: Constants.SERVICE_UUID.rawValue)
            central.scanForPeripherals(withServices: [uuid])
        } else {
            #warning("Error handling")
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        peripherals[peripheral.identifier] = peripheral
    }
}
```

In the same fashion as with the `CBPeripheralManagerDelegate` extension, we satisfy the `centralManagerDidUpdateState` requirement for the `CBCentralManager` this time, and again we are checking if the `central.state` is `.poweredOn` and if it is already scanning then we call the `stopScan`. Finally, we call `scanForPeripherals` and pass the `CBUUID` with the `SERVICE_UUID` that we are using for our application. This way, we are going to scan for devices that advertise this service and ignore all the others.

After starting the scanning process, we have to get informed when a device is discovered and for this reason, we add an implementation for the `didDiscover` requirement of the `CBCentralManagerDelegate`. There, we just update the peripherals dictionary with the peripheral that we have just discovered.

And that's it regarding the `BluetoothManager`. Let's now move on and see how we can use this class.


## Application
 
As mentioned in the introduction, the application will have one screen which will contain a `UITextField` to enter the device name that we will use when calling the `startAdvertising`, and two instances of `UIButton`, one for triggering the advertising process and one for triggering the scanning process.


 Since the post is about `Core Bluetooth` I will focus on how to use the class `CoreBluetoothManager` that we have just created and skip the UI part. The UI is created with UIKit, AutoLayout and programmatic views. Furthermore, the whole code can be found on [GitHub](https://github.com/diamantidis/DemoBluetooth/tree/93f64c32) and it's a Catalyst application, meaning you can run it on iPhone, iPad or Mac. 


To use the `CoreBluetoothManager`, we instantiate an instance of it in the `SceneDelegate` and we inject it to our only `UIViewController`, the `BluetoothViewController`. 

```swift
// SceneDelegate.swift

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    private lazy var bluetoothManager = CoreBluetoothManager()
    .
    . 
    . 


    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        .
        . 
        . 
        let vc = BluetoothViewController(bluetoothManager: bluetoothManager)
        .
        . 
        . 
    }
}

```

In the `BluetoothViewController`, we receive an instance of a class that conforms to the protocol `BluetoothManager` in the init function and we store it in a private property. 

Then, we provide the implementations for the two buttons. For the first one, we use the  `bluetoothManager` to call the `startAdvertising` and we pass the value of the `UITextField` as the device name. For the second button, we set the `delegate` of the `bluetoothManager` to `self` and call the `startScanning` function to trigger the scanning process. 

As a result, we have to make `BluetoothViewController` conform to the protocol `BluetoothManagerDelegate`, by adding an extension and providing an implementation of the method `peripheralsDidUpdate` to fulfill `BluetoothManagerDelegate`'s requirement. In this function, we just print the names of the peripherals on the console, but we could potentially reload an instance of a `UITableView` that would present the nearby devices. 

```swift
// BluetoothViewController.swift

class BluetoothViewController: UIViewController {
    init(bluetoothManager: BluetoothManager) {
        self.bluetoothManager = bluetoothManager
        super.init(nibName: nil, bundle: nil)
    }

    .
    .
    .

    private var bluetoothManager: BluetoothManager

    @objc private func startAdvertising(sender: UIButton!) {
        nameTextField.resignFirstResponder()
        .
        .
        .

        bluetoothManager.startAdvertising(with: name)
    }

    @objc private func startScanning(sender: UIButton) {
        bluetoothManager.delegate = self
        bluetoothManager.startScanning()
    }

}

extension BluetoothViewController: BluetoothManagerDelegate {
    func peripheralsDidUpdate() {
        print(bluetoothManager.peripherals.mapValues{$0.name})
    }
}

```

And that's about it for the application code. But before we run the application, we have to make some further adjustments, to enable the usage of Bluetooth. 

First, we have to add an entry for the key `NSBluetoothAlwaysUsageDescription` to our `Info.plist` file, like in the following snippet 
```
    <key>NSBluetoothAlwaysUsageDescription</key>
    <string>Our app uses Bluetooth to find other devices</string>
```

Then, we have to select the target of the app, go to `Signing & Capabilities` > `App Sandbox` and enable the `Bluetooth` checkbox.

![Bluetooth sandbox screenshot]({{site.url}}/assets/corebluetooth/bluetooth_sandbox.png)


Lastly, make sure to enable the Bluetooth on the device that you are running the application. :smirk:


Now our app is ready!! Feel free to run it and start advertising and scanning for nearby devices! :rocket:

## Conclusion

In this post, we have seen how to use the `CoreBluetooth` framework to advertise that an application is running on a device and also scan for nearby devices that are running the application. These concepts can be used as a base and build more complex application that will rely on Bluetooth and the communication of nearby devices, like for example a chat app, or maybe an AirDrop-like solution to share documents with other non-Apple devices.

Thanks for reading, I hope you find this post useful!
Feel free to find me on [Twitter](https://twitter.com/diamantidis_io) and share your comments about this post!

