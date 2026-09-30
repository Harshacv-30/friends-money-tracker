/* =========================================================
   FRIENDS MONEY TRACKER
   COMPLETE SCRIPT
   ========================================================= */


/* =========================
   LOAD SAVED DATA
   ========================= */

let transactions =
    JSON.parse(
        localStorage.getItem("moneyTransactions")
    ) || [];


let account =
    JSON.parse(
        localStorage.getItem("moneyAccount")
    ) || {
        name: "Harsha",
        startingBalance: 500
    };


let editingId = null;

let settlementFriend = "";

let settlementDirection = "friendPaid";


/* =========================
   SAVE DATA
   ========================= */

function saveData() {

    localStorage.setItem(
        "moneyTransactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "moneyAccount",
        JSON.stringify(account)
    );
}


/* =========================
   HELPERS
   ========================= */

function money(value) {

    return Number(value || 0).toFixed(2);
}


function today() {

    return new Date()
        .toISOString()
        .split("T")[0];
}


function el(id) {

    return document.getElementById(id);
}


function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


function escapeQuotes(value) {

    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'");
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            el("date") &&
            !el("date").value
        ) {
            el("date").value =
                today();
        }


        loadAccount();

        displayAll();


        const form =
            el("transactionForm");


        if (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    saveTransaction();

                }
            );

        }


        if (el("search")) {

            el("search").addEventListener(
                "input",
                displayTransactions
            );

        }


        if (el("filter")) {

            el("filter").addEventListener(
                "change",
                displayTransactions
            );

        }

    }
);


/* =========================================================
   DISPLAY EVERYTHING
   ========================================================= */

function displayAll() {

    updateSummary();

    displayTransactions();

    displayFriendBalances();

    updateAccount();

}


/* =========================================================
   ACCOUNT
   ========================================================= */

function loadAccount() {

    if (el("accountName")) {

        el("accountName").value =
            account.name || "";

    }


    if (el("startingBalance")) {

        el("startingBalance").value =
            account.startingBalance || 0;

    }

}


function saveAccount() {

    const name =
        el("accountName")
            ?.value
            .trim() ||
        "Harsha";


    const startingBalance =
        Number(
            el("startingBalance")
                ?.value
        ) || 0;


    account.name =
        name;


    account.startingBalance =
        startingBalance;


    saveData();

    displayAll();

    showMessage(
        "Account saved successfully! 💾"
    );

}


function updateAccount() {

    let given = 0;

    let received = 0;


    transactions.forEach(
        function (t) {

            const amount =
                Number(t.amount) || 0;


            if (
                t.type === "given"
            ) {

                given += amount;

            }


            else if (
                t.type === "received"
            ) {

                received += amount;

            }


            else if (
                t.type === "settlement"
            ) {

                if (
                    t.direction ===
                    "iPaid"
                ) {

                    given += amount;

                }


                else if (
                    t.direction ===
                    "friendPaid"
                ) {

                    received += amount;

                }

            }

        }
    );


    const available =
        Number(
            account.startingBalance || 0
        )
        +
        received
        -
        given;


    if (el("accountGiven")) {

        el("accountGiven").textContent =
            "₹" + money(given);

    }


    if (el("accountReceived")) {

        el("accountReceived").textContent =
            "₹" + money(received);

    }


    if (el("availableBalance")) {

        el("availableBalance").textContent =
            "₹" + money(available);

    }

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    let given = 0;

    let received = 0;

    let wantGive = 0;

    let theyGive = 0;


    transactions.forEach(
        function (t) {

            const amount =
                Number(t.amount) || 0;


            if (
                t.type === "given"
            ) {

                given += amount;

            }


            else if (
                t.type === "received"
            ) {

                received += amount;

            }


            else if (
                t.type === "wantGive"
            ) {

                wantGive += amount;

            }


            else if (
                t.type === "theyGive"
            ) {

                theyGive += amount;

            }


            else if (
                t.type === "settlement"
            ) {

                if (
                    t.direction ===
                    "friendPaid"
                ) {

                    received += amount;

                }


                else if (
                    t.direction ===
                    "iPaid"
                ) {

                    given += amount;

                }

            }

        }
    );


    const remainingWantGive =
        getTotalRemainingPlanned(
            "wantGive"
        );


    const remainingTheyGive =
        getTotalRemainingPlanned(
            "theyGive"
        );


    if (el("givenTotal")) {

        el("givenTotal").textContent =
            "₹" + money(given);

    }


    if (el("receivedTotal")) {

        el("receivedTotal").textContent =
            "₹" + money(received);

    }


    if (el("wantGiveTotal")) {

        el("wantGiveTotal").textContent =
            "₹" +
            money(remainingWantGive);

    }


    if (el("theyGiveTotal")) {

        el("theyGiveTotal").textContent =
            "₹" +
            money(remainingTheyGive);

    }


    const currentBalance =

        Number(
            account.startingBalance || 0
        )

        +

        received

        -

        given;


    if (el("currentBalance")) {

        el("currentBalance").textContent =
            "₹" +
            money(currentBalance);

    }

}


/* =========================================================
   ADD / UPDATE TRANSACTION
   ========================================================= */

function saveTransaction() {

    const friend =
        el("friendName")
            ?.value
            .trim();


    const amount =
        Number(
            el("amount")?.value
        );


    const date =
        el("date")?.value ||
        today();


    const type =
        el("transactionType")
            ?.value;


    const note =
        el("note")
            ?.value
            .trim() ||
        "";


    if (!friend) {

        alert(
            "Please enter your friend's name."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    if (!type) {

        alert(
            "Please select a transaction type."
        );

        return;

    }


    /* =========================
       EDIT EXISTING
       ========================= */

    if (editingId !== null) {

        const index =
            transactions.findIndex(
                t =>
                    t.id ===
                    editingId
            );


        if (index !== -1) {

            transactions[index].friend =
                friend;

            transactions[index].amount =
                amount;

            transactions[index].date =
                date;

            transactions[index].type =
                type;

            transactions[index].note =
                note;

        }


        editingId = null;


        const submitButton =
            document.querySelector(
                '#transactionForm button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Add Transaction";

        }

    }


    /* =========================
       ADD NEW
       ========================= */

    else {

        transactions.push({

            id:
                Date.now(),

            friend:
                friend,

            amount:
                amount,

            date:
                date,

            type:
                type,

            note:
                note

        });

    }


    saveData();

    clearForm();

    displayAll();


    showMessage(
        "Transaction saved successfully! 💰"
    );

}


/* =========================================================
   FRIEND BALANCE
   ========================================================= */

function getFriendBalance(
    friendName,
    excludeId = null
) {

    let given = 0;

    let received = 0;


    transactions.forEach(
        function (t) {

            if (
                t.id ===
                excludeId
            ) {

                return;

            }


            if (
                String(t.friend)
                    .toLowerCase() !==
                String(friendName)
                    .toLowerCase()
            ) {

                return;

            }


            const amount =
                Number(t.amount) || 0;


            if (
                t.type ===
                "given"
            ) {

                given += amount;

            }


            else if (
                t.type ===
                "received"
            ) {

                received += amount;

            }


            else if (
                t.type ===
                "settlement"
            ) {

                if (
                    t.direction ===
                    "friendPaid"
                ) {

                    received += amount;

                }


                else if (
                    t.direction ===
                    "iPaid"
                ) {

                    given += amount;

                }

            }

        }
    );


    return given - received;

}


/* =========================================================
   ACTUAL MONEY ACTIVITY
   ========================================================= */

function hasActualMoneyActivity(
    friendName
) {

    return transactions.some(
        function (t) {

            if (
                String(t.friend)
                    .toLowerCase() !==
                String(friendName)
                    .toLowerCase()
            ) {

                return false;

            }


            return (

                t.type === "given"

                ||

                t.type === "received"

                ||

                t.type === "settlement"

            );

        }
    );

}


/* =========================================================
   FRIEND BALANCES
   ========================================================= */

function displayFriendBalances() {

    const container =
        el("friendBalances");


    if (!container) {
        return;
    }


    const friends = [];


    transactions.forEach(
        function (t) {

            if (!t.friend) {
                return;
            }


            const exists =
                friends.some(
                    name =>
                        name.toLowerCase() ===
                        t.friend.toLowerCase()
                );


            if (!exists) {

                friends.push(
                    t.friend
                );

            }

        }
    );


    container.innerHTML =
        "";


    if (
        friends.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                No friends yet 👥
            </div>

        `;

        return;

    }


    friends.sort(
        function (a, b) {

            return a.localeCompare(b);

        }
    );


    friends.forEach(
        function (friend) {

            const balance =
                getFriendBalance(
                    friend
                );


            let actualHTML = "";


            if (
                balance > 0.009
            ) {

                actualHTML = `

                    <div class="friend-owe">

                        💰 Owes you
                        ₹${money(balance)}

                    </div>

                `;

            }


            else if (
                balance < -0.009
            ) {

                actualHTML = `

                    <div class="you-owe">

                        💸 You owe
                        ₹${money(
                            Math.abs(balance)
                        )}

                    </div>

                `;

            }


            else if (
                hasActualMoneyActivity(
                    friend
                )
            ) {

                actualHTML = `

                    <div class="settled">

                        ✅ Settled ₹0.00

                    </div>

                `;

            }


            const planned =
                getFriendPlannedTotals(
                    friend
                );


            let plannedHTML = "";


            if (
                planned.wantGive > 0.009
            ) {

                plannedHTML += `

                    <div class="planned">

                        📌 You still want to give:
                        ₹${money(
                            planned.wantGive
                        )}

                    </div>

                `;

            }


            if (
                planned.theyGive > 0.009
            ) {

                plannedHTML += `

                    <div class="planned">

                        🤝 They still need to give:
                        ₹${money(
                            planned.theyGive
                        )}

                    </div>

                `;

            }


            let buttonText =
                "💰 Settle";


            if (
                balance < -0.009
            ) {

                buttonText =
                    "💸 Record Payment";

            }


            container.innerHTML += `

                <div class="friend-card">

                    <div class="friend-card-top">

                        <div>

                            <h3>
                                👤
                                ${escapeHTML(friend)}
                            </h3>

                            ${actualHTML}

                            ${plannedHTML}

                        </div>


                        <div class="friend-action">

                            <button
                                class="settle-btn"
                                onclick="openSettlementModal(
                                    '${escapeQuotes(friend)}',
                                    ${balance}
                                )"
                            >

                                ${buttonText}

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   FRIEND PLANNED TOTALS
   ========================================================= */

function getFriendPlannedTotals(
    friendName
) {

    let want = 0;

    let they = 0;

    let actualGiven = 0;

    let actualReceived = 0;


    transactions.forEach(
        function (t) {

            if (
                String(t.friend)
                    .toLowerCase() !==
                String(friendName)
                    .toLowerCase()
            ) {

                return;

            }


            const amount =
                Number(t.amount) || 0;


            if (
                t.type ===
                "wantGive"
            ) {

                want += amount;

            }


            else if (
                t.type ===
                "theyGive"
            ) {

                they += amount;

            }


            else if (
                t.type ===
                "given"
            ) {

                actualGiven +=
                    amount;

            }


            else if (
                t.type ===
                "received"
            ) {

                actualReceived +=
                    amount;

            }


            else if (
                t.type ===
                "settlement"
            ) {

                if (
                    t.direction ===
                    "iPaid"
                ) {

                    actualGiven +=
                        amount;

                }


                else if (
                    t.direction ===
                    "friendPaid"
                ) {

                    actualReceived +=
                        amount;

                }

            }

        }
    );


    return {

        wantGive:
            Math.max(
                0,
                want -
                actualGiven
            ),

        theyGive:
            Math.max(
                0,
                they -
                actualReceived
            )

    };

}


/* =========================================================
   TOTAL REMAINING PLANNED
   ========================================================= */

function getTotalRemainingPlanned(
    type
) {

    let total = 0;

    const friends = {};


    transactions.forEach(
        function (t) {

            if (!t.friend) {
                return;
            }


            const friend =
                String(t.friend)
                    .trim()
                    .toLowerCase();


            if (!friends[friend]) {

                friends[friend] = {

                    want: 0,

                    they: 0,

                    given: 0,

                    received: 0

                };

            }


            const amount =
                Number(t.amount) || 0;


            if (
                t.type ===
                "wantGive"
            ) {

                friends[friend].want +=
                    amount;

            }


            else if (
                t.type ===
                "theyGive"
            ) {

                friends[friend].they +=
                    amount;

            }


            else if (
                t.type ===
                "given"
            ) {

                friends[friend].given +=
                    amount;

            }


            else if (
                t.type ===
                "received"
            ) {

                friends[friend].received +=
                    amount;

            }


            else if (
                t.type ===
                "settlement"
            ) {

                if (
                    t.direction ===
                    "iPaid"
                ) {

                    friends[friend].given +=
                        amount;

                }


                else if (
                    t.direction ===
                    "friendPaid"
                ) {

                    friends[friend].received +=
                        amount;

                }

            }

        }
    );


    Object.keys(friends).forEach(
        function (friend) {

            if (
                type ===
                "wantGive"
            ) {

                total +=
                    Math.max(
                        0,
                        friends[friend].want -
                        friends[friend].given
                    );

            }


            else {

                total +=
                    Math.max(
                        0,
                        friends[friend].they -
                        friends[friend].received
                    );

            }

        }
    );


    return total;

}


/* =========================================================
   SUMMARY DETAILS
   ========================================================= */

function openSummaryDetails(
    type
) {

    const modal =
        el("summaryModal");

    const title =
        el("summaryModalTitle");

    const list =
        el("summaryDetailsList");


    if (
        !modal ||
        !title ||
        !list
    ) {

        return;

    }


    let titleText = "";

    let icon = "";

    let items = [];


    /* ================= GIVEN ================= */

    if (
        type ===
        "given"
    ) {

        titleText =
            "💸 Money I Gave";

        icon = "💸";


        items =
            transactions.filter(
                function (t) {

                    return (

                        t.type ===
                        "given"

                        ||

                        (
                            t.type ===
                            "settlement"

                            &&

                            t.direction ===
                            "iPaid"
                        )

                    );

                }
            );

    }


    /* ================= RECEIVED ================= */

    else if (
        type ===
        "received"
    ) {

        titleText =
            "💰 Money I Received";

        icon = "💰";


        items =
            transactions.filter(
                function (t) {

                    return (

                        t.type ===
                        "received"

                        ||

                        (
                            t.type ===
                            "settlement"

                            &&

                            t.direction ===
                            "friendPaid"
                        )

                    );

                }
            );

    }


    /* ================= WANT GIVE ================= */

    else if (
        type ===
        "wantGive"
    ) {

        titleText =
            "📌 I Still Want to Give";

        icon = "📌";


        items =
            getRemainingPlannedTransactions(
                "wantGive"
            );

    }


    /* ================= THEY GIVE ================= */

    else if (
        type ===
        "theyGive"
    ) {

        titleText =
            "🤝 They Still Need to Give";

        icon = "🤝";


        items =
            getRemainingPlannedTransactions(
                "theyGive"
            );

    }


    title.textContent =
        titleText;


    list.innerHTML =
        "";


    if (
        items.length ===
        0
    ) {

        list.innerHTML = `

            <div class="summary-empty">
                No pending details 🎉
            </div>

        `;

        modal.classList.add(
            "show"
        );

        return;

    }


    let total = 0;


    items.forEach(
        function (item) {

            const amount =
                Number(item.amount) || 0;


            total += amount;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "summary-person";


            let description =
                "";


            if (
                type ===
                "given"
            ) {

                description =
                    item.type ===
                    "settlement"

                    ?

                    "Settlement / payment"

                    :

                    "Money given";

            }


            else if (
                type ===
                "received"
            ) {

                description =
                    item.type ===
                    "settlement"

                    ?

                    "Settlement / payment received"

                    :

                    "Money received";

            }


            else if (
                type ===
                "wantGive"
            ) {

                description =
                    "Still need to give";

            }


            else {

                description =
                    "Still expected from them";

            }


            row.innerHTML = `

                <div
                    class="summary-person-info"
                >

                    <strong>

                        ${icon}

                        ${escapeHTML(
                            item.friend
                        )}

                    </strong>


                    <small>

                        ${description}

                        ${
                            item.date
                                ?
                                " • " +
                                escapeHTML(
                                    item.date
                                )
                                :
                                ""
                        }

                    </small>

                </div>


                <div
                    class="summary-person-amount"
                >

                    ₹${money(amount)}

                </div>

            `;


            list.appendChild(row);

        }
    );


    list.innerHTML += `

        <div class="summary-total">

            Total:
            ₹${money(total)}

        </div>

    `;


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   REMAINING PLANNED TRANSACTIONS
   ========================================================= */

function getRemainingPlannedTransactions(
    type
) {

    const planned = {};

    const actual = {};


    transactions.forEach(
        function (t) {

            if (!t.friend) {
                return;
            }


            const friend =
                String(t.friend)
                    .trim()
                    .toLowerCase();


            if (
                t.type ===
                type
            ) {

                if (
                    !planned[friend]
                ) {

                    planned[friend] = {

                        friend:
                            t.friend,

                        amount:
                            0,

                        date:
                            t.date

                    };

                }


                planned[friend].amount +=
                    Number(t.amount) || 0;

            }


            if (
                type ===
                "wantGive"
            ) {

                if (
                    t.type ===
                    "given"
                ) {

                    actual[friend] =
                        (
                            actual[friend] ||
                            0
                        )
                        +
                        (
                            Number(t.amount) ||
                            0
                        );

                }


                if (
                    t.type ===
                    "settlement"

                    &&

                    t.direction ===
                    "iPaid"
                ) {

                    actual[friend] =
                        (
                            actual[friend] ||
                            0
                        )
                        +
                        (
                            Number(t.amount) ||
                            0
                        );

                }

            }


            if (
                type ===
                "theyGive"
            ) {

                if (
                    t.type ===
                    "received"
                ) {

                    actual[friend] =
                        (
                            actual[friend] ||
                            0
                        )
                        +
                        (
                            Number(t.amount) ||
                            0
                        );

                }


                if (
                    t.type ===
                    "settlement"

                    &&

                    t.direction ===
                    "friendPaid"
                ) {

                    actual[friend] =
                        (
                            actual[friend] ||
                            0
                        )
                        +
                        (
                            Number(t.amount) ||
                            0
                        );

                }

            }

        }
    );


    const result = [];


    Object.keys(planned).forEach(
        function (friend) {

            const plannedAmount =
                planned[friend].amount;


            const actualAmount =
                actual[friend] ||
                0;


            const remaining =
                Math.max(
                    0,
                    plannedAmount -
                    actualAmount
                );


            if (
                remaining >
                0.009
            ) {

                result.push({

                    friend:
                        planned[friend].friend,

                    amount:
                        remaining,

                    date:
                        planned[friend].date,

                    type:
                        type

                });

            }

        }
    );


    return result;

}


/* =========================================================
   CLOSE SUMMARY MODAL
   ========================================================= */

function closeSummaryDetails() {

    const modal =
        el("summaryModal");


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   OPEN SETTLEMENT
   ========================================================= */

function openSettlementModal(
    friendName,
    balance
) {

    settlementFriend =
        friendName;


    const modal =
        el("settlementModal");


    if (!modal) {
        return;
    }


    if (
        el("settlementFriend")
    ) {

        el("settlementFriend")
            .textContent =
            friendName;

    }


    if (
        el("settlementBalance")
    ) {

        if (
            balance > 0.009
        ) {

            el("settlementBalance")
                .textContent =
                `They owe you ₹${money(
                    balance
                )}`;

        }


        else if (
            balance < -0.009
        ) {

            el("settlementBalance")
                .textContent =
                `You owe them ₹${money(
                    Math.abs(balance)
                )}`;

        }


        else {

            el("settlementBalance")
                .textContent =
                "No outstanding balance — record a new payment";

        }

    }


    if (
        balance > 0.009
    ) {

        settlementDirection =
            "friendPaid";

    }

    else {

        settlementDirection =
            "iPaid";

    }


    updateSettlementButtons();


    if (
        el("settlementAmount")
    ) {

        if (
            Math.abs(balance) >
            0.009
        ) {

            el("settlementAmount")
                .value =
                Math.abs(balance);

        }

        else {

            el("settlementAmount")
                .value = "";

        }

    }


    delete modal.dataset.editingId;


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE SETTLEMENT
   ========================================================= */

function closeSettlementModal() {

    const modal =
        el("settlementModal");


    if (modal) {

        modal.classList.remove(
            "show"
        );

        delete modal.dataset.editingId;

    }


    settlementFriend =
        "";

    settlementDirection =
        "friendPaid";

}


/* =========================================================
   CHOOSE SETTLEMENT
   ========================================================= */

function chooseSettlementDirection(
    direction
) {

    settlementDirection =
        direction;


    updateSettlementButtons();

}


/* =========================================================
   SETTLEMENT BUTTONS
   ========================================================= */

function updateSettlementButtons() {

    const friendPaidBtn =
        el("friendPaidBtn");

    const iPaidBtn =
        el("iPaidBtn");


    if (friendPaidBtn) {

        friendPaidBtn.classList.toggle(
            "selected",
            settlementDirection ===
            "friendPaid"
        );

    }


    if (iPaidBtn) {

        iPaidBtn.classList.toggle(
            "selected",
            settlementDirection ===
            "iPaid"
        );

    }

}


/* =========================================================
   HANDLE SETTLEMENT SAVE
   ========================================================= */

function handleSettlementSave() {

    const modal =
        el("settlementModal");


    if (
        modal &&
        modal.dataset.editingId
    ) {

        saveEditedSettlement();

    }

    else {

        confirmSettlement();

    }

}


/* =========================================================
   CONFIRM SETTLEMENT
   ========================================================= */

function confirmSettlement() {

    if (!settlementFriend) {

        alert(
            "Please select a friend."
        );

        return;

    }


    const amount =
        Number(
            el("settlementAmount")
                ?.value
        );


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    const currentBalance =
        getFriendBalance(
            settlementFriend
        );


    if (
        settlementDirection ===
        "friendPaid"
    ) {

        if (
            currentBalance <=
            0.009
        ) {

            alert(
                "They don't currently owe you any money."
            );

            return;

        }


        if (
            amount >
            currentBalance +
            0.009
        ) {

            alert(
                `They only owe you ₹${money(
                    currentBalance
                )}.`
            );

            return;

        }

    }


    if (
        settlementDirection ===
        "iPaid"
    ) {

        if (
            currentBalance <
            -0.009
        ) {

            const debt =
                Math.abs(
                    currentBalance
                );


            if (
                amount >
                debt +
                0.009
            ) {

                alert(
                    `You only owe them ₹${money(
                        debt
                    )}.`
                );

                return;

            }

        }

    }


    transactions.push({

        id:
            Date.now(),

        friend:
            settlementFriend,

        amount:
            amount,

        date:
            today(),

        type:
            "settlement",

        direction:
            settlementDirection,

        note:
            "Settlement"

    });


    saveData();

    closeSettlementModal();

    displayAll();


    if (
        settlementDirection ===
        "friendPaid"
    ) {

        showMessage(
            "Payment received! 🤝💰"
        );

    }

    else {

        showMessage(
            "Payment recorded! 💸"
        );

    }

}


/* =========================================================
   EDIT TRANSACTION
   ========================================================= */

function editTransaction(id) {

    const transaction =
        transactions.find(
            t =>
                t.id === id
        );


    if (!transaction) {
        return;
    }


    if (
        transaction.type ===
        "settlement"
    ) {

        editSettlement(
            transaction
        );

        return;

    }


    editingId =
        id;


    if (el("friendName")) {

        el("friendName")
            .value =
            transaction.friend;

    }


    if (el("amount")) {

        el("amount")
            .value =
            transaction.amount;

    }


    if (el("date")) {

        el("date")
            .value =
            transaction.date;

    }


    if (el("transactionType")) {

        el("transactionType")
            .value =
            transaction.type;

    }


    if (el("note")) {

        el("note")
            .value =
            transaction.note ||
            "";

    }


    const button =
        document.querySelector(
            '#transactionForm button[type="submit"]'
        );


    if (button) {

        button.textContent =
            "Update Transaction";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   EDIT SETTLEMENT
   ========================================================= */

function editSettlement(
    transaction
) {

    const modal =
        el("settlementModal");


    if (!modal) {
        return;
    }


    settlementFriend =
        transaction.friend;


    settlementDirection =
        transaction.direction;


    if (
        el("settlementFriend")
    ) {

        el("settlementFriend")
            .textContent =
            transaction.friend;

    }


    if (
        el("settlementAmount")
    ) {

        el("settlementAmount")
            .value =
            transaction.amount;

    }


    const balance =
        getFriendBalance(
            transaction.friend,
            transaction.id
        );


    if (
        el("settlementBalance")
    ) {

        if (
            balance > 0.009
        ) {

            el("settlementBalance")
                .textContent =
                `They owe you ₹${money(
                    balance
                )}`;

        }


        else if (
            balance < -0.009
        ) {

            el("settlementBalance")
                .textContent =
                `You owe them ₹${money(
                    Math.abs(balance)
                )}`;

        }


        else {

            el("settlementBalance")
                .textContent =
                "No outstanding balance — editing this payment";

        }

    }


    updateSettlementButtons();


    modal.dataset.editingId =
        transaction.id;


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   SAVE EDITED SETTLEMENT
   ========================================================= */

function saveEditedSettlement() {

    const modal =
        el("settlementModal");


    if (!modal) {
        return;
    }


    const id =
        Number(
            modal.dataset.editingId
        );


    if (!id) {
        return;
    }


    const transaction =
        transactions.find(
            t =>
                t.id === id
        );


    if (!transaction) {
        return;
    }


    const amount =
        Number(
            el("settlementAmount")
                ?.value
        );


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    const balance =
        getFriendBalance(
            settlementFriend,
            id
        );


    if (
        settlementDirection ===
        "friendPaid"
    ) {

        if (
            balance <=
            0.009
        ) {

            alert(
                "They don't currently owe you this money."
            );

            return;

        }


        if (
            amount >
            balance +
            0.009
        ) {

            alert(
                `Maximum available amount is ₹${money(
                    balance
                )}.`
            );

            return;

        }

    }


    if (
        settlementDirection ===
        "iPaid"
    ) {

        if (
            balance <
            -0.009
        ) {

            const debt =
                Math.abs(balance);


            if (
                amount >
                debt +
                0.009
            ) {

                alert(
                    `Maximum amount is ₹${money(
                        debt
                    )}.`
                );

                return;

            }

        }

    }


    transaction.friend =
        settlementFriend;


    transaction.amount =
        amount;


    transaction.direction =
        settlementDirection;


    transaction.date =
        today();


    transaction.note =
        "Settlement";


    saveData();

    closeSettlementModal();

    displayAll();


    showMessage(
        "Settlement updated successfully! ✏️"
    );

}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            t =>
                t.id === id
        );


    if (!transaction) {
        return;
    }


    const confirmed =
        confirm(
            `Delete this transaction of ₹${money(
                transaction.amount
            )}?`
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            t =>
                t.id !== id
        );


    saveData();

    displayAll();


    showMessage(
        "Transaction deleted 🗑️"
    );

}


/* =========================================================
   CLEAR ALL
   ========================================================= */

function clearAll() {

    const confirmed =
        confirm(
            "Are you sure you want to delete ALL transactions?"
        );


    if (!confirmed) {
        return;
    }


    transactions = [];


    saveData();

    displayAll();


    showMessage(
        "All transactions cleared 🗑️"
    );

}


/* =========================================================
   CLEAR FORM
   ========================================================= */

function clearForm() {

    editingId =
        null;


    if (el("friendName")) {

        el("friendName")
            .value =
            "";

    }


    if (el("amount")) {

        el("amount")
            .value =
            "";

    }


    if (el("date")) {

        el("date")
            .value =
            today();

    }


    if (el("transactionType")) {

        el("transactionType")
            .value =
            "given";

    }


    if (el("note")) {

        el("note")
            .value =
            "";

    }


    const button =
        document.querySelector(
            '#transactionForm button[type="submit"]'
        );


    if (button) {

        button.textContent =
            "Add Transaction";

    }

}


/* =========================================================
   TRANSACTION HISTORY
   ========================================================= */

function displayTransactions() {

    const container =
        el("transactionHistory");


    if (!container) {
        return;
    }


    const searchText =
        el("search")
            ?.value
            .trim()
            .toLowerCase() ||
        "";


    const filter =
        el("filter")
            ?.value ||
        "all";


    let filtered =
        [...transactions]
            .sort(
                (a, b) =>
                    b.id - a.id
            );


    /* =====================================================
       SEARCH FRIEND
       
       IMPORTANT:
       When a friend is searched, we first collect ALL
       transactions connected to that friend.
       
       The transaction filter is NOT applied afterward.
       ===================================================== */

    if (searchText) {

        filtered =
            filtered.filter(
                function (t) {

                    return (

                        String(
                            t.friend
                        )
                        .toLowerCase()
                        .includes(
                            searchText
                        )

                        ||

                        String(
                            t.note ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            searchText
                        )

                    );

                }
            );


        /*
           DO NOT apply the transaction type filter here.
           
           This is what makes searching "Rahul" show:
           
           💸 Given
           💰 Received
           📌 Want to Give
           🤝 They Want to Give
           ✅ Settlements
           
           all together.
        */

    }


    /*
       Only use the type filter when there is NO search.
    */

    else if (
        filter !==
        "all"
    ) {

        filtered =
            filtered.filter(
                t =>
                    t.type ===
                    filter
            );

    }


    container.innerHTML =
        "";


    /*
       Show friend search header.
    */

    if (searchText) {

        const friendMatches =
            filtered.filter(
                t =>
                    String(t.friend)
                        .toLowerCase()
                        .includes(searchText)
            );


        if (
            friendMatches.length >
            0
        ) {

            const names = [
                ...new Set(
                    friendMatches.map(
                        t =>
                            t.friend
                    )
                )
            ];


            container.innerHTML = `

                <div
                    class="search-result-header"
                >

                    🔎 Showing complete history for

                    <strong>
                        ${escapeHTML(
                            names.join(", ")
                        )}
                    </strong>

                    <small>
                        ${filtered.length}
                        transaction(s) found —
                        including settlements and
                        planned transactions.
                    </small>

                </div>

            `;

        }

    }


    if (
        filtered.length ===
        0
    ) {

        container.innerHTML += `

            <div class="empty-state">

                No transactions found 📭

            </div>

        `;

        return;

    }


    filtered.forEach(
        function (t) {

            let icon =
                "";

            let title =
                "";

            let amountClass =
                "";


            if (
                t.type ===
                "given"
            ) {

                icon =
                    "💸";

                title =
                    "Money I Gave";

                amountClass =
                    "given-amount";

            }


            else if (
                t.type ===
                "received"
            ) {

                icon =
                    "💰";

                title =
                    "Money I Received";

                amountClass =
                    "received-amount";

            }


            else if (
                t.type ===
                "wantGive"
            ) {

                icon =
                    "📌";

                title =
                    "I Want to Give";

                amountClass =
                    "planned-amount";

            }


            else if (
                t.type ===
                "theyGive"
            ) {

                icon =
                    "🤝";

                title =
                    "They Want to Give";

                amountClass =
                    "planned-amount";

            }


            else if (
                t.type ===
                "settlement"
            ) {

                if (
                    t.direction ===
                    "friendPaid"
                ) {

                    icon =
                        "💰";

                    title =
                        "Settlement — They Paid You";

                    amountClass =
                        "received-amount";

                }


                else {

                    icon =
                        "💸";

                    title =
                        "Settlement — You Paid Them";

                    amountClass =
                        "given-amount";

                }

            }


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "transaction-row";


            row.innerHTML = `

                <div
                    class="transaction-info"
                >

                    <strong>

                        ${icon}

                        ${escapeHTML(
                            t.friend
                        )}

                    </strong>


                    <span>

                        ${title}

                    </span>


                    <small>

                        ${
                            t.date
                                ?
                                escapeHTML(
                                    t.date
                                )
                                :
                                ""
                        }

                        ${
                            t.note
                                ?
                                " • " +
                                escapeHTML(
                                    t.note
                                )
                                :
                                ""
                        }

                    </small>

                </div>


                <div
                    class="
                        transaction-amount
                        ${amountClass}
                    "
                >

                    ₹${money(
                        t.amount
                    )}

                </div>


                <div
                    class="transaction-actions"
                >

                    <button
                        class="edit-btn"
                        onclick="editTransaction(
                            ${t.id}
                        )"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(
                            ${t.id}
                        )"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   MESSAGE
   ========================================================= */

let messageTimer = null;


function showMessage(
    text
) {

    const message =
        el("message");


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.classList.add(
        "show"
    );


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(
            function () {

                message.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
   ========================================================= */

window.addEventListener(
    "click",
    function (event) {

        const settlementModal =
            el("settlementModal");

        const summaryModal =
            el("summaryModal");


        if (
            event.target ===
            settlementModal
        ) {

            closeSettlementModal();

        }


        if (
            event.target ===
            summaryModal
        ) {

            closeSummaryDetails();

        }

    }
);