//
//  ListViewController.swift
//  BaeminMap
//
//  Created by woowabrothers on 2017. 8. 4..
//  Copyright © 2017년 woowabrothers. All rights reserved.
//

import UIKit
import AlamofireImage

class ListViewController: UIViewController {

    @IBOutlet weak var listView: UITableView!
    var baeminInfo = BaeminInfoData.shared.listBaeminInfo

    override func viewDidLoad() {
        super.viewDidLoad()
        listView.delegate = self
        listView.dataSource = self
        NotificationCenter.default.addObserver(self, selector: #selector(recieve), name: NSNotification.Name.listBaeminInfo, object: nil)
    }

    override func viewDidAppear(_ animated: Bool) {
        showNoshop()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    func recieve(notification: Notification) {
        baeminInfo = BaeminInfoData.shared.listBaeminInfo
        showNoshop()
        listView.reloadData()
        listView.setContentOffset(CGPoint.zero, animated: false)
    }

    func showNoshop() {
        if listView.subviews.last is UIImageView {
            listView.subviews.last?.removeFromSuperview()
            listView.isUserInteractionEnabled = true
        }
        if baeminInfo.isEmpty {
            let rect = CGRect(x: 0, y: 0, width: listView.frame.width, height: listView.frame.height-82)
            #imageLiteral(resourceName: "noshopman").defaultImage(target: listView, frame: rect)
        }
    }

}

extension ListViewController: UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return baeminInfo.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = Bundle.main.loadNibNamed("ListTableViewCell", owner: self, options: nil)?.first as! ListTableViewCell
        let shop = baeminInfo[indexPath.row]
        let distance = shop.distance.convertDistance()
        if let url = shop.shopLogoImageUrl {
            cell.shopImageView.af_setImage(withURL: URL(string: url)!, completion: { (_) in
                cell.shopImageView.isHidden = false
            })
        } else {
            cell.shopImageView.isHidden = false
        }
        cell.titleLabel.text = shop.shopName
        cell.reviewLabel.text = "최근리뷰 \(String(shop.reviewCount))"
        cell.ownerReviewLabel.text = "최근사장님댓글 \(String(shop.reviewCountCeo))"
        cell.ratingView.rating = shop.starPointAverage
        cell.distanceLabel.text = "\(shop.distance > 1 ? "\(distance)km" : "\(Int(distance))m")"
        cell.isPay(baro: shop.useBaropay, meet: shop.useMeetPay)

        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let detailViewController = UIStoryboard.detailViewStoryboard.instantiateViewController(withIdentifier: "DetailView") as! DetailViewController
        detailViewController.baeminInfo = baeminInfo[indexPath.row]
        navigationController?.pushViewController(detailViewController, animated: true)
    }

    func tableView(_ tableView: UITableView, didHighlightRowAt indexPath: IndexPath) {
        let cell  = tableView.cellForRow(at: indexPath)
        cell?.contentView.backgroundColor = UIColor(red: 235/255, green: 235/255, blue: 235/255, alpha: 1)
    }

    func tableView(_ tableView: UITableView, didUnhighlightRowAt indexPath: IndexPath) {
        let cell  = tableView.cellForRow(at: indexPath)
        cell?.contentView.backgroundColor = .clear
    }
}
