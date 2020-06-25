// USE EVENT DELEGATION FOR TABLE (52:00)
// GET DATA FROM SERVER ON LOAD

const baseURL = `http://flip2.engr.oregonstate.edu:5659`;  // Base URL for database

window.onload = () => {
    makeTable();
};

// POST new entry in workout log
document.getElementById("add_new").addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var name = document.getElementById("add_name").value;
    var reps = document.getElementById("add_reps").value;
    var weight = document.getElementById("add_weight").value;
    var unit = document.getElementById("add_unit").value;
    var date = document.getElementById("add_date").value;
    req.open("POST", baseURL, true);
    req.setRequestHeader('Content-Type', 'application/json');
    data = {"name": name, "reps":reps, "weight":weight, "unit":unit, "date":date};
    setTimeout(function(){
        makeTable();
    }, 500);
    req.send(JSON.stringify(data));
    event.preventDefault();
});

// RESET TABLE
document.getElementById("reset").addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    url = baseURL+"/reset-table";
    req.open("GET", url, true);
    location.reload();
    req.send(null);
    event.preventDefault();
});

// Dynamically make workout table
const makeTable = () => {
    // DELETE EXISTING TABLE
    var table_div = document.getElementById('add_table');
    while (table_div.hasChildNodes()){
        table_div.removeChild(table_div.firstChild);
    }
    // Dynamically reload table
    // Function to load data
    var req = new XMLHttpRequest();
    req.addEventListener('load', () => {
        var response = JSON.parse(req.responseText);
        var data = JSON.parse(response.results);
        if (data == null){ return };
        // MAKE TABLE
        // CREATE UPDATED TABLE
        var table = document.createElement('table');
        table.setAttribute("id", "table");
        table_div.appendChild(table);

        // MAKE HEADER ROW
        var row = document.createElement('tr');
        table.appendChild(row);
        var header_text = ["id", "Name", "Reps", "Weight", "Unit", "Date", "Update", "Delete"];
        for (let i=0; i<=7; i++){
            var header = document.createElement('th');
            header.width = "100px";
            var txt = document.createTextNode(header_text[i]);
            header.style = "border: solid black 1px;";
            row.appendChild(header).appendChild(txt);
        }
        // MAKE DATA ROWS
        if (data.length == 0){ return }; // Return if no values in table
        for (let i=0; i<=data.length-1; i++){
            var row = document.createElement('tr');
            table.appendChild(row);
            // Convert Dates to MM-DD-YYY Format
            data[i].date = convertDate(data[i].date);
            if (data[i].unit == 0){
                data[i].unit = 'pounds';
            } else {
                if (data[i].unit == 1){
                    data[i].unit = 'kilograms';
                }
            }
            for (let j=0; j<=5; j++){
                var data_text = [data[i].id, data[i].name, data[i].reps, data[i].weight, data[i].unit, data[i].date, "Update", "Delete"];
                var cell = document.createElement('td');
                var txt = document.createTextNode(data_text[j]);
                cell.style = "border: solid black 1px; text-align:center";
                row.appendChild(cell).appendChild(txt);
            }
            // ADD UPDATE AND DELETE BUTTONS
            // Update Button
            var cell = document.createElement('td');
            var btn = document.createElement("button");
            cell.style = "border: solid black 1px; text-align:center";
            btn.innerHTML = "Update";
            row.appendChild(cell).appendChild(btn);

            //  Delete button
            var cell = document.createElement('td');
            var btn = document.createElement("button");
            cell.style = "border: solid black 1px; text-align:center";
            btn.innerHTML = "Delete";
            row.appendChild(cell).appendChild(btn);

            // Hide first column with id
            const rows = document.querySelectorAll('tr');
            const rowsArray = Array.from(rows);
            for (i=0; i< rowsArray.length; i++){
                var del_col = document.getElementById('table').rows[i].cells[0];
                del_col.style = "display: none";
            }
        }

        setTimeout(function(){
            // EVENT LISTENER FOR UPDATE AND DELETE BUTTONS
            const table = document.getElementById('table');
            const rows = document.querySelectorAll('tr');
            const rowsArray = Array.from(rows);

            table.addEventListener('click', (event) => {
                const rowIndex = rowsArray.findIndex(row => row.contains(event.target));
                const columns = Array.from(rowsArray[rowIndex].querySelectorAll('td'));
                const columnIndex = columns.findIndex(column => column.contains(event.target));

                // Delete button pressed
                if (columnIndex != 7 && columnIndex !=6){ return };
                if (columnIndex == 6){ updateRow(rowIndex)};
                if (columnIndex == 7){
                    var id = document.getElementById('table').rows[rowIndex].cells[0].innerHTML;
                    console.log(id)

                    // CODE TO DELETE ROW
                    var req = new XMLHttpRequest();
                    setTimeout(function(){
                        makeTable();
                    }, 500);
                    req.open("DELETE", baseURL, true);
                    req.setRequestHeader('Content-Type', 'application/json');
                    data = {"id": id};
                    req.send(JSON.stringify(data));
                }
            }, 0);
        }, 0);
    });
    req.open("GET", baseURL, true);
    req.send(null);
};

const updateRow = (rowIndex) => {
    console.log(rowIndex); // Test: Row 1, id = 3
    // Create DONE button
    var done_btn = document.getElementById('table').rows[rowIndex].cells[6];
    var btn_HTML = "<button type='button' id='done' style= 'width:60px';>Done</button>";
    done_btn.innerHTML = btn_HTML;

    var id = document.getElementById('table').rows[rowIndex].cells[0];

    // Create Form for Select Row
    var table = document.getElementById('table');
    var name_form = document.getElementById('table').rows[rowIndex].cells[1];
    var nameHTML = "<input type='text' id='name_val' name='name' placeholder='Exercise Name' style = 'width:100px';></input>";
    name_form.innerHTML = nameHTML;

    var reps_form = document.getElementById('table').rows[rowIndex].cells[2];
    var repsHTML = "<input type='number' id='reps_val' name='reps' placeholder='Reps' style='width:100px';></input>";
    reps_form.innerHTML = repsHTML;

    var weight_form = document.getElementById('table').rows[rowIndex].cells[3];
    var weightHTML = "<input type='number' id='weight_val' name='weight' placeholder='Weight' style='width:100px'></input>";
    weight_form.innerHTML = weightHTML;

    var unit_form = document.getElementById('table').rows[rowIndex].cells[4];
    var unitHTML = "<input type='number' id='unit_val' name='unit' placeholder='0=lbs, 1=kg' style='width:100px';></input>";
    unit_form.innerHTML = unitHTML;

    var date_form = document.getElementById('table').rows[rowIndex].cells[5];
    var dateHTML = "<input type='date' id='date_val' name='name' placeholder='Date' style='width:100px'></input>";
    date_form.innerHTML = dateHTML;

    var name = document.getElementById('name_val');
    var reps = document.getElementById('reps_val');
    var weight = document.getElementById('weight_val');
    var unit = document.getElementById('unit_val');
    var date = document.getElementById('date_val');


    // EVENT LISTENER FOR DONE BUTTON
    document.getElementById("done").addEventListener('click', (event) => {
        var req = new XMLHttpRequest();
        id = id.innerHTML;
        name = name.value;
        reps = reps.value;
        weight = weight.value;
        unit = unit.value;
        date=date.value;
        req.open("PUT", baseURL, true);
        req.setRequestHeader('Content-Type', 'application/json');
        data = {"id": id, "name": name, "reps":reps, "weight":weight, "unit":unit, "date":date};

        setTimeout(function(){
            makeTable();
        }, 500);
        req.send(JSON.stringify(data));
        event.preventDefault();
    });
};

const convertDate = (date) => {
    if (date == null){
        console.log('Null');
        return
    }
    var trunc_date = date.slice(0,11);
    var year = trunc_date.slice(0,4);
    var month = trunc_date.slice(5, 7);
    var day = trunc_date.slice(8, 10);
    var converted = month + '/' + day + '/' + year;
    return converted
}