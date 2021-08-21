if (networkEnabled) {
  var url = 'https://' + explorer
  var githubRepo = 'https://api.github.com/repos/dogecash/dogecash-web-wallet/releases';
  var getBlockCount = function() {
    var request = new XMLHttpRequest();
    request.open('GET', "https://stakecubecoin.net/pivx/blocks", true);
    request.onload = function () {
      let data = Number(this.response);
      // If the block count has changed, refresh all of our data!
      if (data > cachedBlockCount) {
        console.log("New block detected! " + cachedBlockCount + " --> " + data);
        if (publicKeyForNetwork)
          getUnspentTransactions();
      }
      cachedBlockCount = data;
    }
    request.send();
  }
  var getUnspentTransactions = function () {
    var request = new XMLHttpRequest()
    request.open('GET', "https://api2.dogecash.org/unspent/" + publicKeyForNetwork, true)
    request.onload = function () {
      data = JSON.parse(this.response);
      // Stop the loading spinner
      let reloader = document.getElementById("balanceReload");
      reloader.className = reloader.className.replace(/ playAnim/g, "");
      if (!data.result || data.result.length === 0) {
        console.log('No unspent Transactions');
        document.getElementById("errorNotice").innerHTML = '<div class="alert alert-danger" role="alert"><h4>Note:</h4><h5>You don\'t have any funds, get some coins first!</h5></div>';
        cachedUTXOs = [];
      } else {
        cachedUTXOs = [];
        amountOfTransactions = data.result.length;
        if (amountOfTransactions > 0)
          document.getElementById("errorNotice").innerHTML = '';
        if (amountOfTransactions <= 1000) {
          for (i = 0; i < amountOfTransactions; i++) {
            cachedUTXOs.push({
              'id': data.result[i].txid,
              'index': data.result[i].index,
              'script': data.result[i].script,
              'value': data.result[i].value
            });
          }
          // Update the GUI with the newly cached UTXO set
          getBalance(true);
        } else {
          //Temporary message for when there are alot of inputs
          //Probably use change all of this to using websockets will work better
          document.getElementById("errorNotice").innerHTML = '<div class="alert alert-danger" role="alert"><h4>Note:</h4><h5>This address has over 1000 UTXOs, which may be problematic for the wallet to handle, transact with caution!</h5></div>';
        }
      }
    }
    request.send()
  }
  var sendTransaction = function (hex) {
    if (typeof hex !== 'undefined') {
      var request = new XMLHttpRequest();
      request.open('POST', 'https://api2.dogecash.org/broadcast', true);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      request.onload = function () {
        data = JSON.parse(this.response);
        if (data.result && data.result.length === 64) {
          console.log('Transaction sent! ' + data);
          if (domAddress1s.value !== donationAddress)
            document.getElementById("transactionFinal").innerHTML = ('<br><h4 style="color:green">Transaction sent! ' + data.result + '</h4>');
          else
            document.getElementById("transactionFinal").innerHTML = ('<br><h4 style="color:green">Thank you for supporting MyDOGECWallet! 💜💜💜<br>' + data + '</h4>');
          domSimpleTXs.style.display = 'none';
          domAddress1s.value = '';
          domValue1s.innerHTML = '';
        } else {
          console.log('Error sending transaction: ' + data);
          document.getElementById("transactionFinal").innerHTML = ('<br><h4 style="color:red">Error sending transaction: ' + data.error.message + "</h4>");
        }
      }

      request.send('raw=' + hex);
    } else {
      console.log("hex undefined");
    }
  }
  var calculatefee = function (bytes) {
    // TEMPORARY: Hardcoded fee per-byte
    fee = Number(((bytes * 250) / COIN).toFixed(8)); // 250 sat/byte

    /*var request = new XMLHttpRequest()
    request.open('GET', url + '/api/v1/estimatefee/10', false)
    request.onload = function () {
      data = JSON.parse(this.response)
      console.log(data);
      console.log('current fee rate' + data['result']);
      fee = data['result'];
    }
    request.send()*/
  }
  var versionCheck = function () {
    var request = new XMLHttpRequest()
    request.open('GET', githubRepo, true)
    request.onload = function () {
      data = JSON.parse(this.response)
      var currentReleaseVersion = (data[0]['tag_name']).replace("V", "")
      if (parseFloat(currentReleaseVersion) > parseFloat(wallet_version)) {
        console.log("out of date");
        document.getElementById("outdated").style.display = 'block';
      }
    }
    request.send()
  }
  //Call a version check if network is enabled:
  //versionCheck();
  document.getElementById('Network').innerHTML = "<b> Network:</b> Enabled";
}
