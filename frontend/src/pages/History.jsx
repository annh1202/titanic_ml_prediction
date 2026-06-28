
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lịch sử dự đoán Titanic</title>

    <style>
        body{
            font-family: Arial, sans-serif;
            background-color:#f2f2f2;
        }

        .container{
            width:850px;
            margin:30px auto;
            background:white;
            padding:20px;
            border:1px solid #ccc;
        }

        h1{
            text-align:center;
            color:#003366;
        }

        p{
            text-align:center;
            color:gray;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        th,td{
            border:1px solid #ccc;
            padding:10px;
            text-align:center;
        }

        th{
            background:#003366;
            color:white;
        }

        .song{
            color:green;
            font-weight:bold;
        }

        .chet{
            color:red;
            font-weight:bold;
        }

        .button{
            text-align:center;
            margin-top:20px;
        }

        button{
            padding:10px 20px;
            border:none;
            color:white;
            cursor:pointer;
            margin:5px;
        }

        .btn-new{
            background:#003366;
        }

        .btn-delete{
            background:red;
        }

        button:hover{
            opacity:0.8;
        }
    </style>

</head>
<body>

<div class="container">

    <h1>Dự đoán sống sót trên tàu Titanic</h1>

    <p>Danh sách các lần dự đoán của người dùng</p>

    <table>

        <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>Giới tính</th>
            <th>Tuổi</th>
            <th>Hạng vé</th>
            <th>Kết quả</th>
            <th>Ngày dự đoán</th>
        </tr>

        <tr>
            <td>Nguyễn Văn A</td>
            <td>Nam</td>
            <td>28</td>
            <td>Hạng 1</td>
            <td class="song">Sống sót</td>
            <td>15/04/1912</td>
        </tr>

        <tr>
            <td>Trần Thị B</td>
            <td>Nữ</td>
            <td>30</td>
            <td>Hạng 3</td>
            <td class="chet">Không sống sót</td>
            <td>16/04/1912</td>
        </tr>

        <tr>
            <td>Lê Văn C</td>
            <td>Nam</td>
            <td>35</td>
            <td>Hạng 2</td>
            <td class="chet">Không sống sót</td>
            <td>15/04/1912</td>
        </tr>

    </table>

    <div class="button">
        <button class="btn-new">Dự đoán mới</button>
        <button class="btn-delete">Xóa lịch sử</button>
    </div>

</div>

</body>
</html>

