//
//  Extension.swift
//  BaeminMap
//
//  Created by HannaJeon on 2017. 8. 7..
//  Copyright © 2017년 HannaJeon. All rights reserved.
//

import UIKit

extension UIStoryboard {
    static let listViewStoryboard = UIStoryboard(name: "ListView", bundle: nil)
    static let mapViewStoryboard = UIStoryboard(name: "MapView", bundle: nil)
    static let mainContainerViewStoryboard = UIStoryboard(name: "MainContainerView", bundle: nil)
    static let detailViewStoryboard = UIStoryboard(name: "DetailView", bundle: nil)
    static let filterViewStoryboard = UIStoryboard(name: "FilterView", bundle: nil)
}

extension Double {
    func roundTo(places:Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return Darwin.round(self * divisor) / divisor
    }

    func convertDistance() -> Double {
        if self > 1 {
            return self.roundTo(places: 1)
        } else {
            return Darwin.round(self * 1000)
        }
    }
}

extension UIColor {
    static let pointColor = UIColor(red: 42/255, green: 193/255, blue: 188/255, alpha: 1)
}

extension UIScrollView {
    func scrollToSection(y: CGFloat) {
        let bottomOffset = CGPoint(x: 0, y: contentOffset.y + y)
        if(bottomOffset.y > 0) {
            setContentOffset(bottomOffset, animated: true)
        }
    }
}

extension UINavigationBar {
    static func setNavigation() {
        self.appearance().tintColor = UIColor.black
        self.appearance().barTintColor = UIColor.white
        self.appearance().backIndicatorImage = #imageLiteral(resourceName: "backbutton")
        self.appearance().backIndicatorTransitionMaskImage = #imageLiteral(resourceName: "backbutton")
    }
}

extension UILabel {
    func ablePay() {
        self.layer.borderWidth = 1
        self.layer.borderColor = UIColor.black.cgColor
        self.layer.cornerRadius = self.layer.frame.height/2
    }
}
